use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("dao11111111111111111111111111111111111111");

#[program]
pub mod inspatial_dao {
    use super::*;

    // Initialize the DAO with core settings
    pub fn initialize_dao(
        ctx: Context<InitializeDao>,
        governance_config: GovernanceConfig,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.governance_config = governance_config;
        dao.total_contributors = 0;
        dao.treasury = ctx.accounts.treasury.key();
        Ok(())
    }

    // Add a new contributor to the DAO
    pub fn add_contributor(
        ctx: Context<AddContributor>,
        github_handle: String,
        monthly_compensation: u64,
    ) -> Result<()> {
        let contributor = &mut ctx.accounts.contributor;
        let dao = &mut ctx.accounts.dao;

        contributor.github_handle = github_handle;
        contributor.monthly_compensation = monthly_compensation;
        contributor.joined_date = Clock::get()?.unix_timestamp;
        contributor.contribution_score = 0;
        contributor.is_core_maintainer = false;
        
        dao.total_contributors += 1;
        
        Ok(())
    }

    // Create a new package proposal
    pub fn create_package_proposal(
        ctx: Context<CreatePackageProposal>,
        name: String,
        description: String,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let dao = &ctx.accounts.dao;

        require!(
            name.starts_with("InSpatial"),
            CustomError::InvalidPackageName
        );

        proposal.proposer = ctx.accounts.proposer.key();
        proposal.name = name;
        proposal.description = description;
        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.status = ProposalStatus::Active;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.voting_ends_at = Clock::get()?.unix_timestamp + dao.governance_config.voting_period;

        Ok(())
    }

    // Cast a vote on a package proposal
    pub fn cast_vote(
        ctx: Context<CastVote>,
        vote: bool,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let voter = &ctx.accounts.voter;

        require!(
            proposal.status == ProposalStatus::Active,
            CustomError::ProposalNotActive
        );

        require!(
            Clock::get()?.unix_timestamp < proposal.voting_ends_at,
            CustomError::VotingPeriodEnded
        );

        // Weight votes based on contribution score
        let vote_weight = voter.contribution_score + 1;

        if vote {
            proposal.yes_votes += vote_weight;
        } else {
            proposal.no_votes += vote_weight;
        }

        Ok(())
    }

    // Update contributor's monthly compensation
    pub fn update_compensation(
        ctx: Context<UpdateCompensation>,
        new_compensation: u64,
    ) -> Result<()> {
        let contributor = &mut ctx.accounts.contributor;
        
        // Require quarterly review period
        let current_time = Clock::get()?.unix_timestamp;
        let time_since_last_update = current_time - contributor.last_compensation_update;
        require!(
            time_since_last_update >= 7776000, // 90 days
            CustomError::TooEarlyForUpdate
        );

        contributor.monthly_compensation = new_compensation;
        contributor.last_compensation_update = current_time;

        Ok(())
    }

    // Distribute monthly compensation
    pub fn distribute_compensation(
        ctx: Context<DistributeCompensation>,
    ) -> Result<()> {
        let contributor = &ctx.accounts.contributor;
        let dao = &ctx.accounts.dao;

        // Transfer tokens from treasury to contributor
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &dao.treasury,
            &contributor.key(),
            contributor.monthly_compensation,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.treasury.to_account_info(),
                ctx.accounts.contributor_account.to_account_info(),
            ],
            &[&[
                b"treasury",
                &[ctx.bumps.treasury],
            ]],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeDao<'info> {
    #[account(init, payer = payer, space = 8 + 256)]
    pub dao: Account<'info, DaoState>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is safe because we just store the key
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddContributor<'info> {
    #[account(mut)]
    pub dao: Account<'info, DaoState>,
    #[account(init, payer = payer, space = 8 + 256)]
    pub contributor: Account<'info, Contributor>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePackageProposal<'info> {
    pub dao: Account<'info, DaoState>,
    #[account(init, payer = proposer, space = 8 + 512)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub voter: Account<'info, Contributor>,
}

#[derive(Accounts)]
pub struct UpdateCompensation<'info> {
    pub dao: Account<'info, DaoState>,
    #[account(mut)]
    pub contributor: Account<'info, Contributor>,
    #[account(constraint = authority.key() == dao.authority)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DistributeCompensation<'info> {
    pub dao: Account<'info, DaoState>,
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub contributor: Account<'info, Contributor>,
    #[account(mut)]
    pub contributor_account: AccountInfo<'info>,
}

#[account]
pub struct DaoState {
    pub governance_config: GovernanceConfig,
    pub total_contributors: u32,
    pub treasury: Pubkey,
    pub authority: Pubkey,
}

#[account]
pub struct Contributor {
    pub github_handle: String,
    pub monthly_compensation: u64,
    pub joined_date: i64,
    pub last_compensation_update: i64,
    pub contribution_score: u32,
    pub is_core_maintainer: bool,
}

#[account]
pub struct Proposal {
    pub proposer: Pubkey,
    pub name: String,
    pub description: String,
    pub yes_votes: u32,
    pub no_votes: u32,
    pub status: ProposalStatus,
    pub created_at: i64,
    pub voting_ends_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ProposalStatus {
    Active,
    Approved,
    Rejected,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GovernanceConfig {
    pub voting_period: i64,          // Duration in seconds
    pub approval_threshold: u32,     // Minimum votes needed for approval
    pub quorum_threshold: u32,       // Minimum participation required
}

#[error_code]
pub enum CustomError {
    InvalidPackageName,
    ProposalNotActive,
    VotingPeriodEnded,
    TooEarlyForUpdate,
}