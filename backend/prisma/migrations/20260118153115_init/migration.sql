BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [full_name] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'VIEWER',
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [users_status_df] DEFAULT 'ACTIVE',
    [last_login_at] DATETIME2,
    [created_by] NVARCHAR(1000),
    [updated_by] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[senders] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [full_name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [address] NVARCHAR(1000) NOT NULL,
    [city] NVARCHAR(1000) NOT NULL,
    [country] NVARCHAR(1000) NOT NULL,
    [identity_type] NVARCHAR(1000) NOT NULL,
    [identity_number] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [senders_status_df] DEFAULT 'pending_verification',
    [created_by] NVARCHAR(1000),
    [updated_by] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [senders_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [senders_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [senders_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [senders_identity_number_key] UNIQUE NONCLUSTERED ([identity_number])
);

-- CreateTable
CREATE TABLE [dbo].[receivers] (
    [id] NVARCHAR(1000) NOT NULL,
    [sender_id] NVARCHAR(1000) NOT NULL,
    [full_name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [address] NVARCHAR(1000) NOT NULL,
    [city] NVARCHAR(1000) NOT NULL,
    [country] NVARCHAR(1000) NOT NULL,
    [relationship] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [receivers_status_df] DEFAULT 'active',
    [created_by] NVARCHAR(1000),
    [updated_by] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [receivers_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [receivers_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[transactions] (
    [id] NVARCHAR(1000) NOT NULL,
    [transaction_id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [sender_id] NVARCHAR(1000) NOT NULL,
    [receiver_id] NVARCHAR(1000) NOT NULL,
    [amount_jpy] FLOAT(53) NOT NULL,
    [amount_npr] FLOAT(53) NOT NULL,
    [service_fee] FLOAT(53) NOT NULL,
    [exchange_rate] FLOAT(53) NOT NULL,
    [total_amount_jpy] FLOAT(53) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [transactions_status_df] DEFAULT 'pending',
    [purpose] NVARCHAR(1000) NOT NULL,
    [notes] NVARCHAR(1000),
    [processed_at] DATETIME2,
    [completed_at] DATETIME2,
    [cancelled_at] DATETIME2,
    [cancelled_reason] NVARCHAR(1000),
    [created_by] NVARCHAR(1000),
    [updated_by] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [transactions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [transactions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [transactions_transaction_id_key] UNIQUE NONCLUSTERED ([transaction_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_created_by_fkey] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_updated_by_fkey] FOREIGN KEY ([updated_by]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[senders] ADD CONSTRAINT [senders_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[receivers] ADD CONSTRAINT [receivers_sender_id_fkey] FOREIGN KEY ([sender_id]) REFERENCES [dbo].[senders]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[transactions] ADD CONSTRAINT [transactions_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[transactions] ADD CONSTRAINT [transactions_sender_id_fkey] FOREIGN KEY ([sender_id]) REFERENCES [dbo].[senders]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[transactions] ADD CONSTRAINT [transactions_receiver_id_fkey] FOREIGN KEY ([receiver_id]) REFERENCES [dbo].[receivers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
