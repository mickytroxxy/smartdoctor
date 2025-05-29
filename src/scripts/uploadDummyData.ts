import { uploadDummyData } from '../helpers/dummyData';

// Run the upload function
uploadDummyData()
  .then(() => {
    console.log('Dummy data upload completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error uploading dummy data:', error);
    process.exit(1);
  }); 