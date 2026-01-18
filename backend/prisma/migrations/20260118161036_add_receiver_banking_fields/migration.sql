/*
  Warnings:

  - Added the required column `account_number` to the `receivers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_branch` to the `receivers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_name` to the `receivers` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[receivers] ALTER COLUMN [email] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[receivers] ADD [account_number] NVARCHAR(1000) NOT NULL,
[bank_branch] NVARCHAR(1000) NOT NULL,
[bank_name] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
