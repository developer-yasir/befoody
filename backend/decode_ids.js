const mongoose = require('mongoose');

const id1 = new mongoose.Types.ObjectId('698d87629844844583908042'); // From script
const id2 = new mongoose.Types.ObjectId('698db0f18e16307a2b53dd31'); // From frontend log

console.log('ID 1 (Script):', id1.getTimestamp());
console.log('ID 2 (Frontend):', id2.getTimestamp());
