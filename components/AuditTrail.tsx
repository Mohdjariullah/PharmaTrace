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
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Package,
  Repeat,
  Flag,
  Award,
  Scan
} from 'lucide-react';
import { getAuditEvents, getRecentAuditEvents, AuditEvent } from '@/services/auditService';
import { formatDate } from '@/services/qrService';
import { getExplorerUrl, truncatePublicKey } from '@/lib/solana';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditTrailProps {
  batchId?: string;
  showRecent?: boolean;
  maxEvents?: number;
}

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

  const getEventColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'from-green-500 to-emerald-500';
      case 'medium':
        return 'from-blue-500 to-cyan-500';
      case 'high':
        return 'from-orange-500 to-red-500';
      case 'critical':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-blue-100 text-blue-700 border-blue-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      critical: 'bg-red-100 text-red-700 border-red-200'
    };

    return (
      <Badge className={colors[severity as keyof typeof colors] || colors.low}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const formatEventTitle = (eventType: string) => {
    return eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {batchId ? `Audit Trail - ${batchId}` : 'Recent Activity'}
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
              className="text-sm border rounded-lg px-3 py-1 bg-background"
            >
              <option value="all">All Events</option>
              <option value="batch_registered">Registrations</option>
              <option value="batch_transferred">Transfers</option>
              <option value="batch_flagged">Flags</option>
              <option value="batch_verified">Verifications</option>
              <option value="nft_minted">NFT Mints</option>
              <option value="qr_scanned">QR Scans</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvents}
              disabled={loading}
            >
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
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
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
              const colorClass = getEventColor(event.severity);
              
              return (
                <div key={event.id || index} className="group">
                  <div className="flex items-start gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <EventIcon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                              className="font-mono text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                            >
                              {truncatePublicKey(event.transaction_signature)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {Object.keys(event.metadata).length > 0 && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-2">Event Details:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
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
          <div className="mt-6 pt-4 border-t text-center">
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