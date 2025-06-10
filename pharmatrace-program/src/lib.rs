use anchor_lang::prelude::*;

declare_id!("7QUnqWD9rAAy5PNCpvXqZxYXfPW7G9SrWKJ3osTWy2EL");

#[program]
pub mod pharmatrace {
    use super::*;

    pub fn init_batch(
        ctx: Context<InitBatch>,
        batch_id: String,
        product_name: String,
        mfg_date: String,
        exp_date: String,
        ipfs_hash: String,
    ) -> Result<()> {
        let batch_account = &mut ctx.accounts.batch_account;
        
        // Validate input lengths
        require!(batch_id.len() <= 64, PharmaTraceError::BatchIdTooLong);
        require!(product_name.len() <= 128, PharmaTraceError::ProductNameTooLong);
        require!(mfg_date.len() <= 32, PharmaTraceError::DateTooLong);
        require!(exp_date.len() <= 32, PharmaTraceError::DateTooLong);
        require!(ipfs_hash.len() <= 128, PharmaTraceError::IpfsHashTooLong);
        
        // Initialize batch data
        batch_account.batch_id = batch_id;
        batch_account.product_name = product_name;
        batch_account.manufacturer = ctx.accounts.manufacturer.key();
        batch_account.current_owner = ctx.accounts.manufacturer.key();
        batch_account.mfg_date = mfg_date;
        batch_account.exp_date = exp_date;
        batch_account.status = BatchStatus::Valid;
        batch_account.ipfs_hash = ipfs_hash;
        batch_account.created_at = Clock::get()?.unix_timestamp;
        batch_account.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(BatchInitialized {
            batch_id: batch_account.batch_id.clone(),
            manufacturer: batch_account.manufacturer,
            product_name: batch_account.product_name.clone(),
        });
        
        Ok(())
    }

    pub fn transfer_batch(ctx: Context<TransferBatch>) -> Result<()> {
        let batch_account = &mut ctx.accounts.batch_account;
        
        // Verify current owner
        require!(
            batch_account.current_owner == ctx.accounts.current_owner.key(),
            PharmaTraceError::NotCurrentOwner
        );
        
        // Verify batch is not flagged
        require!(
            batch_account.status != BatchStatus::Flagged,
            PharmaTraceError::BatchFlagged
        );
        
        // Transfer ownership
        let old_owner = batch_account.current_owner;
        batch_account.current_owner = ctx.accounts.new_owner.key();
        batch_account.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(BatchTransferred {
            batch_id: batch_account.batch_id.clone(),
            from: old_owner,
            to: batch_account.current_owner,
        });
        
        Ok(())
    }

    pub fn flag_batch(ctx: Context<FlagBatch>, reason: String) -> Result<()> {
        let batch_account = &mut ctx.accounts.batch_account;
        
        // Validate reason length
        require!(reason.len() <= 256, PharmaTraceError::ReasonTooLong);
        require!(reason.len() > 0, PharmaTraceError::ReasonEmpty);
        
        // Only allow flagging if not already flagged
        require!(
            batch_account.status != BatchStatus::Flagged,
            PharmaTraceError::AlreadyFlagged
        );
        
        // Flag the batch
        batch_account.status = BatchStatus::Flagged;
        batch_account.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(BatchFlagged {
            batch_id: batch_account.batch_id.clone(),
            flagged_by: ctx.accounts.regulator.key(),
            reason,
        });
        
        Ok(())
    }

    pub fn update_batch_status(
        ctx: Context<UpdateBatchStatus>,
        new_status: BatchStatus,
    ) -> Result<()> {
        let batch_account = &mut ctx.accounts.batch_account;
        
        // Verify current owner or regulator
        require!(
            batch_account.current_owner == ctx.accounts.authority.key(),
            PharmaTraceError::NotAuthorized
        );
        
        batch_account.status = new_status;
        batch_account.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(BatchStatusUpdated {
            batch_id: batch_account.batch_id.clone(),
            new_status,
            updated_by: ctx.accounts.authority.key(),
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(batch_id: String)]
pub struct InitBatch<'info> {
    #[account(
        init,
        payer = manufacturer,
        space = 8 + Batch::INIT_SPACE,
        seeds = [b"batch", batch_id.as_bytes()],
        bump
    )]
    pub batch_account: Account<'info, Batch>,
    
    #[account(mut)]
    pub manufacturer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferBatch<'info> {
    #[account(mut)]
    pub batch_account: Account<'info, Batch>,
    
    pub current_owner: Signer<'info>,
    
    /// CHECK: This is the new owner's public key
    pub new_owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct FlagBatch<'info> {
    #[account(mut)]
    pub batch_account: Account<'info, Batch>,
    
    pub regulator: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateBatchStatus<'info> {
    #[account(mut)]
    pub batch_account: Account<'info, Batch>,
    
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Batch {
    #[max_len(64)]
    pub batch_id: String,
    
    #[max_len(128)]
    pub product_name: String,
    
    pub manufacturer: Pubkey,
    pub current_owner: Pubkey,
    
    #[max_len(32)]
    pub mfg_date: String,
    
    #[max_len(32)]
    pub exp_date: String,
    
    pub status: BatchStatus,
    
    #[max_len(128)]
    pub ipfs_hash: String,
    
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BatchStatus {
    Valid,
    Flagged,
    Expired,
}

#[event]
pub struct BatchInitialized {
    pub batch_id: String,
    pub manufacturer: Pubkey,
    pub product_name: String,
}

#[event]
pub struct BatchTransferred {
    pub batch_id: String,
    pub from: Pubkey,
    pub to: Pubkey,
}

#[event]
pub struct BatchFlagged {
    pub batch_id: String,
    pub flagged_by: Pubkey,
    pub reason: String,
}

#[event]
pub struct BatchStatusUpdated {
    pub batch_id: String,
    pub new_status: BatchStatus,
    pub updated_by: Pubkey,
}

#[error_code]
pub enum PharmaTraceError {
    #[msg("Batch ID is too long (max 64 characters)")]
    BatchIdTooLong,
    
    #[msg("Product name is too long (max 128 characters)")]
    ProductNameTooLong,
    
    #[msg("Date string is too long (max 32 characters)")]
    DateTooLong,
    
    #[msg("IPFS hash is too long (max 128 characters)")]
    IpfsHashTooLong,
    
    #[msg("Reason is too long (max 256 characters)")]
    ReasonTooLong,
    
    #[msg("Reason cannot be empty")]
    ReasonEmpty,
    
    #[msg("You are not the current owner of this batch")]
    NotCurrentOwner,
    
    #[msg("This batch has been flagged and cannot be transferred")]
    BatchFlagged,
    
    #[msg("This batch is already flagged")]
    AlreadyFlagged,
    
    #[msg("You are not authorized to perform this action")]
    NotAuthorized,
}