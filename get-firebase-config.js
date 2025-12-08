/**
 * Helper script to extract Firebase configuration values
 * 
 * Run this in your browser console (F12 > Console tab) while your app is running:
 * 
 * 1. Open your application in the browser (http://localhost:3000)
 * 2. Open Developer Tools (F12 or right-click → Inspect)
 * 3. Go to the Console tab
 * 4. Paste this entire script and press Enter
 * 5. Copy the output and use it to replace the values in public/firebase-messaging-sw.js
 */

// Extract Firebase configuration from the window object
const getFirebaseConfig = () => {
    // Try to get config from Firebase app instance
    if (typeof firebase !== 'undefined' && firebase.app) {
        const app = firebase.app();
        const config = app.options;
        return config;
    }

    // Or extract from the page's environment variables (check script tags)
    console.log("Trying to extract Firebase config from environment variables...");
    console.log("Looking in script tags and global variables...");

    // You can also manually extract from your .env.local or Firebase Console
    console.log("\n📋 Or get your config from Firebase Console:");
    console.log("1. Go to https://console.firebase.google.com");
    console.log("2. Select your project: beerapp-26109");
    console.log("3. Click the gear icon ⚙️ → Project settings");
    console.log("4. Scroll down to 'Your apps' section");
    console.log("5. Click on your web app (or create one if it doesn't exist)");
    console.log("6. Copy the firebaseConfig object");

    return null;
};

const config = getFirebaseConfig();

if (config) {
    console.log("\n✅ Firebase Configuration Found:\n");
    console.log("Copy these values to your firebase-messaging-sw.js file:\n");
    console.log("const firebaseConfig = {");
    console.log(`  apiKey: "${config.apiKey}",`);
    console.log(`  authDomain: "${config.authDomain}",`);
    console.log(`  projectId: "${config.projectId}",`);
    console.log(`  storageBucket: "${config.storageBucket}",`);
    console.log(`  messagingSenderId: "${config.messagingSenderId}",`);
    console.log(`  appId: "${config.appId}",`);
    if (config.measurementId) {
        console.log(`  measurementId: "${config.measurementId}",`);
    }
    console.log("};");
} else {
    console.log("\n❌ Could not automatically extract Firebase config.");
    console.log("Please get it from Firebase Console (instructions above).");
}
