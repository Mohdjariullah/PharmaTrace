import { supabase } from '@/lib/supabaseClient';

export interface AuditEvent {
  id?: string;
  event_type: 'batch_registered' | 'batch_transferred' | 'batch_flagged' | 'batch_verified' | 'nft_minted' | 'qr_scanned';
  batch_id?: string;
  user_wallet: string;
  transaction_signature?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DiscordWebhookPayload {
  content?: string;
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp: string;
    footer: {
      text: string;
      icon_url?: string;
    };
  }>;
}

/**
 * Log audit event to database and Discord webhook
 */
export async function logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
  try {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Insert into database
    const { error: dbError } = await supabase
      .from('audit_events')
      .insert(auditEvent);

    if (dbError) {
      console.error('Failed to insert audit event to database:', dbError);
    }

    // Send to Discord webhook
    await sendToDiscordWebhook(auditEvent);

  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

/**
 * Send audit event to Discord webhook
 */
async function sendToDiscordWebhook(event: AuditEvent): Promise<void> {
  const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured');
    return;
  }

  try {
    const embed = createDiscordEmbed(event);
    const payload: DiscordWebhookPayload = {
      embeds: [embed]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }

  } catch (error) {
    console.error('Failed to send to Discord webhook:', error);
  }
}

/**
 * Create Discord embed for audit event
 */
function createDiscordEmbed(event: AuditEvent) {
  const colors = {
    low: 0x00ff00,      // Green
    medium: 0xffff00,   // Yellow
    high: 0xff8000,     // Orange
    critical: 0xff0000  // Red
  };

  const eventTitles = {
    batch_registered: '📦 Batch Registered',
    batch_transferred: '🔄 Batch Transferred',
    batch_flagged: '🚩 Batch Flagged',
    batch_verified: '✅ Batch Verified',
    nft_minted: '🎨 NFT Certificate Minted',
    qr_scanned: '📱 QR Code Scanned'
  };

  const fields = [
    {
      name: 'Event Type',
      value: event.event_type.replace('_', ' ').toUpperCase(),
      inline: true
    },
    {
      name: 'User Wallet',
      value: `\`${event.user_wallet.substring(0, 8)}...${event.user_wallet.substring(-8)}\``,
      inline: true
    },
    {
      name: 'Severity',
      value: event.severity.toUpperCase(),
      inline: true
    }
  ];

  if (event.batch_id) {
    fields.push({
      name: 'Batch ID',
      value: `\`${event.batch_id}\``,
      inline: true
    });
  }

  if (event.transaction_signature) {
    fields.push({
      name: 'Transaction',
      value: `[View on Explorer](https://explorer.solana.com/tx/${event.transaction_signature}?cluster=devnet)`,
      inline: true
    });
  }

  // Add metadata fields
  Object.entries(event.metadata).forEach(([key, value]) => {
    if (fields.length < 25) { // Discord limit
      fields.push({
        name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: String(value).substring(0, 1024), // Discord field value limit
        inline: true
      });
    }
  });

  return {
    title: eventTitles[event.event_type] || '📋 Audit Event',
    description: `PharmaTrace blockchain activity detected`,
    color: colors[event.severity],
    fields,
    timestamp: event.timestamp,
    footer: {
      text: 'PharmaTrace Audit System',
      icon_url: 'https://pharmatrace.com/logo.png' // Your logo URL
    }
  };
}

/**
 * Log batch registration event
 */
export async function logBatchRegistration(
  batchId: string,
  productName: string,
  userWallet: string,
  txSignature: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  await logAuditEvent({
    event_type: 'batch_registered',
    batch_id: batchId,
    user_wallet: userWallet,
    transaction_signature: txSignature,
    metadata: {
      product_name: productName,
      ...metadata
    },
    severity: 'medium'
  });
}

/**
 * Log batch transfer event
 */
export async function logBatchTransfer(
  batchId: string,
  fromWallet: string,
  toWallet: string,
  txSignature: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  await logAuditEvent({
    event_type: 'batch_transferred',
    batch_id: batchId,
    user_wallet: fromWallet,
    transaction_signature: txSignature,
    metadata: {
      from_wallet: fromWallet,
      to_wallet: toWallet,
      ...metadata
    },
    severity: 'high'
  });
}

/**
 * Log batch flagging event
 */
export async function logBatchFlag(
  batchId: string,
  userWallet: string,
  reason: string,
  txSignature: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  await logAuditEvent({
    event_type: 'batch_flagged',
    batch_id: batchId,
    user_wallet: userWallet,
    transaction_signature: txSignature,
    metadata: {
      flag_reason: reason,
      ...metadata
    },
    severity: 'critical'
  });
}

/**
 * Log batch verification event
 */
export async function logBatchVerification(
  batchId: string,
  userWallet: string,
  isValid: boolean,
  metadata: Record<string, any> = {}
): Promise<void> {
  await logAuditEvent({
    event_type: 'batch_verified',
    batch_id: batchId,
    user_wallet: userWallet,
    metadata: {
      is_valid: isValid,
      verification_method: 'qr_scan',
      ...metadata
    },
    severity: isValid ? 'low' : 'high'
  });
}

/**
 * Log NFT minting event
 */
export async function logNFTMinting(
  batchId: string,
  userWallet: string,
  mintAddress: string,
  txSignature: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  await logAuditEvent({
    event_type: 'nft_minted',
    batch_id: batchId,
    user_wallet: userWallet,
    transaction_signature: txSignature,
    metadata: {
      mint_address: mintAddress,
      certificate_type: 'pharmaceutical_batch',
      ...metadata
    },
    severity: 'medium'
  });
}

/**
 * Log QR code scan event
 */
export async function logQRScan(
  batchId: string,
  userWallet: string,
  scanResult: 'success' | 'invalid' | 'fake',
  metadata: Record<string, any> = {}
): Promise<void> {
  await logAuditEvent({
    event_type: 'qr_scanned',
    batch_id: batchId,
    user_wallet: userWallet,
    metadata: {
      scan_result: scanResult,
      scan_method: 'camera',
      ...metadata
    },
    severity: scanResult === 'fake' ? 'critical' : scanResult === 'invalid' ? 'high' : 'low'
  });
}

/**
 * Get audit events for a specific batch
 */
export async function getAuditEvents(batchId: string): Promise<AuditEvent[]> {
  try {
    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .eq('batch_id', batchId)
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching audit events:', error);
    return [];
  }
}

/**
 * Get recent audit events
 */
export async function getRecentAuditEvents(limit: number = 50): Promise<AuditEvent[]> {
  try {
    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recent audit events:', error);
    return [];
  }
}