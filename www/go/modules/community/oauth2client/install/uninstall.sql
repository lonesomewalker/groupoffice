ALTER TABLE `em_accounts` DROP FOREIGN KEY `em_account_defaultclt_ibfk_1`;
DROP TABLE IF EXISTS `oauth2client_account`;
DROP TABLE IF EXISTS `oauth2client_oauth2client`;
DROP TABLE IF EXISTS `oauth2client_default_client`;