# Wallet Registry Privacy Policy

Effective date: 2026-10-14

Wallet Registry records the registration and transfer history of physical paper wallets. This policy applies to the Android test release provided by Runbickers. Contact: runbickers@gmail.com.

## Account and service data

An account uses an email address and a password. The service stores the email, an account identifier, password hashes, sessions and the acknowledgements needed for account operation. The current release does not request a name or phone number and does not verify email ownership. Passwords are transmitted for authentication through the app's HTTPS connection and stored as salted password hashes.

The service processes product identifiers, public addresses, public registration keys, receipt and transfer requests, signatures, transaction identifiers, processing status and recording-cost allowance or reservation records to provide the registry service. Account-linked activity is visible to the operator as needed to operate and investigate requests. Data intended for a transfer may be delivered to its counterpart and the operator.

## Registration keys and encrypted backups

Customer registration keys are distinct from the secret keys controlling coins inside a paper wallet. Customer registration signing occurs on the device. Do not enter the paper wallet's sealed coin private key.

If the user enables server backup, the app encrypts the backup on the device and uploads an encrypted envelope and its version metadata. The backup password is not sent to the server. This backup may include wallet registration keys and device registry records. The operator cannot recover a forgotten backup password through the backup service. Local key storage and app authentication use platform storage and authentication controls.

The operator's recording-cost wallet is a separate service wallet. It pays blockchain recording costs and is not a backup or custodian of the coins inside a customer's physical paper wallet.

## Blockchain and network services

Public blockchain queries and signed transactions are sent to BTCMobick network infrastructure as part of verification and recording. Transaction identifiers and public registration or transfer evidence may become permanently public on the blockchain. Blockchain records cannot be erased by account deletion.

Internet services can receive technical connection information such as IP addresses. The registry backend uses bounded request and authentication rate limits. User-initiated sharing through a QR code, clipboard or the operating system share sheet discloses the information selected by the user to the chosen recipient or service.

## Camera, biometrics and QR SDK

Camera access is used to scan QR codes. Camera images and decoded QR contents are processed locally by the barcode-scanning API. Google ML Kit can collect device and application information, per-installation identifiers, performance metrics, SDK configuration, feature events and error codes for diagnostics and usage analytics, using HTTPS. The app has no separate control for disabling these SDK diagnostics.

Google's disclosure: https://developers.google.com/ml-kit/android-data-disclosure
Google ML Kit terms and privacy: https://developers.google.com/ml-kit/terms

Biometric authentication is optional and uses the operating system. The app does not receive or upload fingerprint or face templates. The current test release does not contain an advertising SDK or an advertising reward feature. The bundled update page does not make OTA updates active in the standard-engine test release; any later change to update-service data handling will be reflected in this policy.

## Deletion and retention

The app offers account deletion in My Page > Account and security, after password confirmation. It deletes the account, associated sessions, server-stored encrypted backups and recording allowances. Public blockchain evidence and device registration keys are not deleted or transferred by deleting the account. Keep a separate backup before deleting an account or the app.

Optional server backups can also be removed using backup controls. Device-only keys and data require device controls; deleting server data does not remove the device's copy. Transfer evidence that has already been sent to a counterpart or recorded publicly cannot be recalled.

To request account or server-backup deletion without using the app, email runbickers@gmail.com from the registered address, with subject "Wallet Registry account deletion". Do not send your password, private keys or backup password. The operator will confirm the requester's authority before processing a deletion request and will explain any data that must remain, such as permanent public blockchain evidence. Account and backup data are kept while needed for the account and removed through the applicable deletion process.

## Purpose, children and changes

Data is used for authentication, registry operation, requested backups, transfer processing, fraud prevention, security and SDK diagnostics. The service does not sell personal information or use wallet records for advertising targeting.

Wallet Registry is intended for adults and is not directed to children. Material changes to data handling will be reflected in this policy and the Play data-safety declaration before the affected release.
