# Privacy Policy — UTXO Control

**Effective date:** 2026-10-15

UTXO Control is a non-custodial BTCMobick wallet utility that lets users inspect and select UTXOs, sign transactions locally, and broadcast signed transactions to the BTCMobick network.

## 1. Data we do not collect

UTXO Control does not require an account and does not operate a user-profile or application-backend database. The app does not supply wallet addresses, balances, private keys or transaction details to advertising requests. Blockchain communications, QR-scanning diagnostics and advertising data processing are described below.

In particular, UTXO Control does **not** collect or transmit:

- WIF private keys or other private-key material;
- seed phrases or wallet backups;
- contact lists, messages, camera images or precise GPS location.

Version 1.0.1 adds Google AdMob advertising and Google's User Messaging Platform (UMP). The earlier 1.0.0 release contains no advertising SDK. QR scanning uses Google ML Kit, which can collect technical diagnostic and usage data as described below.

## 2. Private keys and wallet data

WIF private keys are processed locally on the user's device for address derivation and transaction signing.

Private keys are not uploaded to Runbickers or any application backend. The current release does not provide persistent private-key storage. A WIF may remain in application memory while the current app process is alive so the user can return to an in-progress wallet session after app re-authentication. If the app process is terminated, that in-memory session is lost.

Users are responsible for keeping an independent backup of their private keys or seed phrases. UTXO Control is not a backup service.

## 3. Network communications

To provide wallet functionality, the app communicates with BTCMobick network infrastructure.

The app sends public-blockchain query identifiers such as script hashes to the BTCMobick ElectrumX service at `wallet.mobick.info:40009` to retrieve UTXOs, and sends a fully signed raw transaction when the user chooses to broadcast it. The connection uses TLS and verifies the server certificate fingerprint. Private keys are not included in these network requests.

As with ordinary internet connections, the remote network service may receive technical connection metadata such as the user's IP address. Public-wallet queries and signed blockchain transactions can also reveal public blockchain activity. UTXO Control does not use this information for advertising, analytics, or user profiling.

When a user chooses “View in block explorer,” the app opens the BTCMobick block explorer in an external browser. The browser and the destination website may process network information according to their own privacy policies.

### QR-scanning SDK diagnostics

The Android QR scanner uses Google ML Kit. Google documents collection of device and application information, per-installation identifiers, performance metrics, configuration, feature events and error codes for diagnostics and usage analytics. These data are sent over HTTPS. The app does not provide a separate control to disable SDK diagnostics.

Camera images, decoded QR contents and WIF private keys are processed on the device and are not sent to Google by the barcode-scanning API. SDK diagnostics are distinct from those contents.

Google's disclosure: https://developers.google.com/ml-kit/android-data-disclosure  
Google ML Kit terms and privacy: https://developers.google.com/ml-kit/terms

### Advertising and privacy choices (version 1.0.1 and later)

The app displays banner ads below the PIN unlock, WIF import and UTXO selection screens. An optional rewarded ad can hide banners on this device for 72 hours. Wallet lookup and transfers remain available without watching a rewarded ad. There are no automatic full-screen ads.

Google Mobile Ads may collect and share the device IP address (which can estimate general location), advertising/app-set and other applicable device/account identifiers, app/ad interactions such as launches, taps and video views, and diagnostic/performance information. Google uses these data for advertising, analytics and fraud prevention. SDK data is encrypted in transit. The app does not send the WIF, scanned QR contents, wallet addresses, balances or transaction details as ad-request parameters.

UMP requests applicable consent and provides an advertising privacy-settings entry point when Google requires one. Users can manage those choices through the app's advertising privacy settings where available, and reset or delete their advertising ID in Android settings. Consent choices may affect ad delivery. Hiding banners does not disable QR-scanning diagnostics or erase data already received by Google.

The 72-hour expiry is stored in the device secure store and shared across the app's banner placements. It is not an account entitlement and is not guaranteed to survive clearing data, reinstalling or changing devices. No server-side advertising entitlement is maintained.

Google advertising disclosure: https://developers.google.com/admob/android/privacy/play-data-disclosure

Google Privacy Policy: https://policies.google.com/privacy

How Google uses information from apps: https://policies.google.com/technologies/partner-sites

## 4. Device permissions

UTXO Control may request:

- **Camera:** only for scanning WIF or recipient-address QR codes.
- **Biometric authentication:** to unlock the app or authorize sensitive actions.
- **Advertising ID (version 1.0.1 and later):** the Google Mobile Ads SDK can use Android advertising identifiers for the purposes described above.

QR contents are processed locally and are not sent to Runbickers.

## 5. Data retention and deletion

UTXO Control does not maintain a user account or server-side user database, so there is no server-side personal-data retention or account-deletion process.

Public blockchain transactions may remain permanently available on the network and cannot be removed by Runbickers. Advertising and diagnostic information received by Google is handled under Google's applicable privacy terms and retention practices; Runbickers cannot directly delete Google's SDK records. Device-local PIN settings and the banner-hiding expiry can be removed by clearing app data. For privacy requests, contact runbickers@gmail.com.

Session-only wallet secrets are not intentionally written to persistent app storage. Android or the operating system may terminate the application process at any time, which clears the app's in-memory session.

## 6. Security

The app uses local signing, application locking, biometric authentication where enabled, secure-window protections, and other platform controls. No mobile application can guarantee protection on a rooted, modified, malware-infected, or otherwise compromised device.

## 7. Children

UTXO Control is a cryptocurrency utility and is not directed to children.

## 8. Changes to this policy

Material changes to data handling will be reflected in this policy and the Google Play Data safety declaration before the applicable release.

## 9. Contact

Developer: Runbickers / UTXO Control project  
Website: https://runbickers.com  
Source repository: https://github.com/JeongwooShin/BTCMobickCoinControl

For privacy or security inquiries, email runbickers@gmail.com.
