// Import the required modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define a function to fetch the vapid details
function fetchVapidDetails() {
    // Convert the URL of the current module to a file path
    const __filename = fileURLToPath(import.meta.url);

    // Resolve the file path relative to the current module directory
    const filePath = path.resolve(path.dirname(__filename), './vapid.json');

    // Read the file synchronously
    const data = fs.readFileSync(filePath, 'utf8');

    // Parse the file content as JSON
    const vapid = JSON.parse(data);

    // Return the vapid details
    return vapid;
}

// Export the function to use in server.js
export { fetchVapidDetails };