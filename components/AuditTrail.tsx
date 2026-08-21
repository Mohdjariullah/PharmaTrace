"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Clock,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Package,
  Repeat,
  Flag,
  Award,
  Scan
} from 'lucide-react';
import { getAuditEvents, getRecentAuditEvents, AuditEvent } from '@/services/auditService';
import { getExplorerUrl, truncatePublicKey } from '@/lib/solana';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditTrailProps {
  batchId?: string;
  showRecent?: boolean;
  maxEvents?: number;
}

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "secondary",
  critical: "destructive",
};

export default function AuditTrail({ batchId, showRecent = false, maxEvents = 20 }: AuditTrailProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, [batchId, showRecent]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let data: AuditEvent[];

      if (showRecent) {
        data = await getRecentAuditEvents(maxEvents);
      } else if (batchId) {
        data = await getAuditEvents(batchId);
      } else {
        data = [];
      }

      setEvents(data);
    } catch (error) {
      console.error('Error fetching audit events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.event_type === filter;
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'batch_registered':
        return Package;
      case 'batch_transferred':
        return Repeat;
      case 'batch_flagged':
        return Flag;
      case 'batch_verified':
        return CheckCircle;
      case 'nft_minted':
        return Award;
      case 'qr_scanned':
        return Scan;
      default:
        return Activity;
    }
  };

  const getSeverityBadge = (severity: string) => (
    <Badge variant={SEVERITY_VARIANT[severity] || "outline"} className="text-xs">
      {severity.toUpperCase()}
    </Badge>
  );

  const formatEventTitle = (eventType: string) => {
    return eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary/60">
              <Activity className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <CardTitle className="text-lg">
                {batchId ? `Audit trail — ${batchId}` : 'Recent activity'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Blockchain transaction history and events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            >
              <option value="all">All events</option>
              <option value="batch_registered">Registrations</option>
              <option value="batch_transferred">Transfers</option>
              <option value="batch_flagged">Flags</option>
              <option value="batch_verified">Verifications</option>
              <option value="nft_minted">NFT mints</option>
              <option value="qr_scanned">QR scans</option>
            </select>

            <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
              <Activity className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">No events found</h3>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'No audit events have been recorded yet.'
                : `No ${formatEventTitle(filter)} events found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => {
              const EventIcon = getEventIcon(event.event_type);

              return (
                <div key={event.id || index}>
                  <div className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/40">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/60">
                      <EventIcon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">
                          {formatEventTitle(event.event_type)}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(event.severity)}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                        <div>
                          <span className="text-muted-foreground">User: </span>
                          <span className="font-mono">
                            {truncatePublicKey(event.user_wallet)}
                          </span>
                        </div>

                        {event.batch_id && (
                          <div>
                            <span className="text-muted-foreground">Batch: </span>
                            <span className="font-mono">{event.batch_id}</span>
                          </div>
                        )}

                        {event.transaction_signature && (
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">Transaction: </span>
                            <a
                              href={getExplorerUrl(event.transaction_signature)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-primary hover:text-primary/80"
                            >
                              {truncatePublicKey(event.transaction_signature)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      {Object.keys(event.metadata).length > 0 && (
                        <div className="mt-3 rounded-lg bg-secondary/40 p-3">
                          <div className="mb-2 text-xs text-muted-foreground">Event details:</div>
                          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground">
                                  {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </span>
                                <span className="ml-2 font-medium">
                                  {String(value).length > 50
                                    ? `${String(value).substring(0, 50)}...`
                                    : String(value)
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {index < filteredEvents.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filteredEvents.length > 0 && (
          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEvents.length} of {events.length} events
              {filter !== 'all' && ` (filtered by ${formatEventTitle(filter)})`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
