# 🤝 SplitSafe

**SplitSafe** is a lightweight tool designed for group expense management. It is specifically built for situations where multiple people have paid for various items and the total cost needs to be **split equally** among all participants. It uses a greedy optimization algorithm to ensure the debt is settled with the minimum number of transactions.

> **Note:** This app is designed for equal-split scenarios. To include someone in the settlement who did not pay for anything, they must be added with an expense of 0.

## ✨ Features
* **Smart Settlement:** Minimizes the number of bank transfers needed using a greedy algorithm.
* **Multi-Language:** Support for **English**, **Thai**, and **Chinese**.
* **Multi-Currency:** Independent toggles for **USD**, **THB**, and **EUR**.
* **Offline-First:** Built as a Progressive Web App (PWA)—fully functional without an internet connection once installed.
* **No Accounts:** All data is saved locally on your device for instant access.

## 🛠️ Tech Stack
* **Framework:** React Native (Expo)
* **Platform:** Web (PWA)
* **Storage:** AsyncStorage
* **Styling:** React Native StyleSheet

## 🚀 How to Use
1.  **Add Payers:** Enter the name of the person who paid and the amount.
2.  **Add Non-Payers:** For participants who didn't pay for anything but are part of the split, **add them with an amount of 0**.
3.  **Settle Up:** Click "Finish & Settle" to see the optimized transaction list.
4.  **Share:** Use the Share button to send the settlement plan to your group via WhatsApp, Line, or Messenger.

## 💻 Developer Setup
To run this project locally:
1. Clone the repo: `git clone https://github.com/carefulCamel61097/splitsafe.git`
2. Install dependencies: `npm install`
3. Start the project: `npx expo start`

---
*Created by carefulCamel61097*