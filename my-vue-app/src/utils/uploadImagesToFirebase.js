import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin SDK
import serviceAccount from '../../config/serviceAccountKey.json' assert { type: 'json' };

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'sloop-76866.appspot.com', // Replace with your bucket name
});

const bucket = getStorage().bucket();
const firestore = admin.firestore();

// Path to your folder containing images
const imagesFolder = path.resolve('./public/event-images');

const uploadImagesAndUpdateFirestore = async () => {
  const files = fs.readdirSync(imagesFolder);

  for (const file of files) {
    const filePath = path.join(imagesFolder, file);
    const eventId = path.parse(file).name; // Use file name as event ID

    try {
      // Upload image to Firebase Storage
      await bucket.upload(filePath, {
        destination: `events/${eventId}.jpg`,
        metadata: {
          contentType: 'image/jpeg',
        },
      });
      console.log(`Uploaded ${file} successfully.`);

      // Generate a public URL for the uploaded image
      const fileRef = bucket.file(`events/${eventId}.jpg`);
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2030', // Adjust expiration date as needed
      });

      console.log(`Generated URL for ${file}: ${url}`);

      // Update Firestore with the image URL
      await firestore.collection('events').doc(eventId).update({
        image_url: url,
      });

      console.log(`Updated Firestore for event: ${eventId}`);
    } catch (error) {
      console.error(`Failed to process ${file}:`, error);
    }
  }
};

// Run the function
uploadImagesAndUpdateFirestore();
