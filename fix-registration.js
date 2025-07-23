const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/src/auth/auth.service.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace the team finding logic
const oldTeamFinding = `    // Find the admin's team (first team in the system)
    const adminTeam = await this.teamModel.findOne().sort({ createdAt: 1 });
    if (!adminTeam) {
      throw new ConflictException('No admin team found. Please contact support.');
    }`;

const newTeamFinding = `    // Use the admin's team ID directly
    const adminTeamId = '6872137b3bd64eb1d84237d1'; // Admin's team ID
    const adminTeam = await this.teamModel.findById(adminTeamId);
    if (!adminTeam) {
      throw new ConflictException('Admin team not found. Please contact support.');
    }`;

// Replace the content
content = content.replace(oldTeamFinding, newTeamFinding);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Registration method updated successfully!');
console.log('📝 Changed team finding logic to use hardcoded admin team ID'); 