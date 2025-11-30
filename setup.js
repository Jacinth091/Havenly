const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config({ path: ".env.local" });

const isWindows = process.platform === "win32";
const isMac = process.platform === "darwin";
const isLinux = process.platform === "linux";

console.log("Havenly Modern Setup\n");
console.log("Setting up: JWT Auth, Email, PDF, and more...\n");

function checkComposer() {
  try {
    execSync("composer --version", { stdio: "pipe" });
    return true;
  } catch (error) {
    return false;
  }
}

console.log("📦 Checking Composer installation...");
if (!checkComposer()) {
  console.error("❌ Composer not found!");
  console.log(
    "\nComposer is required for modern PHP features (JWT, Email, PDF)."
  );
  console.log("Please install Composer first:\n");
  console.log("Windows: https://getcomposer.org/download/");
  console.log("Mac:     brew install composer");
  console.log("Linux:   curl -sS https://getcomposer.org/installer | php\n");
  process.exit(1);
}
console.log("✅ Composer is installed\n");

// Step 2: Check if .env.local exists
if (!fs.existsSync(".env.local")) {
  console.error("❌ .env.local not found!");
  console.log(
    "Please copy .env.example to .env.local and configure your paths.\n"
  );
  console.log("Run: cp .env.example .env.local");
  process.exit(1);
}

// Step 3: Get XAMPP path from environment
const xamppPath = process.env.XAMPP_HTDOCS_PATH;
if (!xamppPath) {
  console.error("❌ XAMPP_HTDOCS_PATH not set in .env.local");
  process.exit(1);
}

// Step 4: Validate XAMPP path exists
if (!fs.existsSync(xamppPath)) {
  console.error(`❌ XAMPP htdocs path not found: ${xamppPath}`);
  console.log("Please check your XAMPP installation and update .env.local");
  process.exit(1);
}

console.log("✅ Environment configuration loaded\n");

// Step 5: Install client dependencies
console.log("📦 Installing client (React) dependencies...");
console.log("This may take a few minutes...\n");
try {
  execSync("cd client && npm install", { stdio: "inherit" });
  console.log("✅ Client dependencies installed\n");
} catch (error) {
  console.error("❌ Failed to install client dependencies");
  process.exit(1);
}

console.log("📦 Installing server (PHP) dependencies...");
console.log("Installing: JWT, PHPMailer, DomPDF, Validation...\n");
try {
  const serverPath = path.resolve(__dirname, "server/src");

  // Check if composer.json exists
  if (!fs.existsSync(path.join(serverPath, "composer.json"))) {
    console.log("⚠️  composer.json not found. Skipping Composer install.");
    console.log('You can run "composer install" in the server folder later.\n');
  } else {
    execSync("cd server && composer install", { stdio: "inherit" });
    console.log("✅ Server dependencies installed\n");
  }
} catch (error) {
  console.error("❌ Failed to install server dependencies");
  console.log("You can manually run: cd server && composer install");
  console.log("");
}

// Step 7: Create symbolic link
const serverPath = path.resolve(__dirname, "server");
const symlinkPath = path.join(xamppPath, "havenly-api");

console.log("🔗 Creating symbolic link...");
console.log(`   From: ${serverPath}`);
console.log(`   To: ${symlinkPath}\n`);

try {
  // Check if symlink already exists
  if (fs.existsSync(symlinkPath)) {
    const stats = fs.lstatSync(symlinkPath);
    if (stats.isSymbolicLink()) {
      console.log("⚠️  Symlink already exists. Removing old link...");
      if (isWindows) {
        execSync(`rmdir "${symlinkPath}"`, { stdio: "inherit" });
      } else {
        execSync(`rm "${symlinkPath}"`, { stdio: "inherit" });
      }
    } else {
      console.error(
        "❌ A file/folder with the same name exists at the symlink location"
      );
      console.error(`   Please manually remove: ${symlinkPath}`);
      process.exit(1);
    }
  }

  // Create symlink based on OS
  if (isWindows) {
    execSync(`mklink /D "${symlinkPath}" "${serverPath}"`, {
      stdio: "inherit",
    });
  } else if (isMac || isLinux) {
    execSync(`ln -s "${serverPath}" "${symlinkPath}"`, { stdio: "inherit" });
  }

  console.log("✅ Symbolic link created successfully!\n");
} catch (error) {
  console.error("❌ Failed to create symbolic link");
  console.error(
    "   Make sure you run this script with administrator/sudo privileges\n"
  );

  if (isWindows) {
    console.log("💡 On Windows:");
    console.log("   1. Open PowerShell or Command Prompt as Administrator");
    console.log("   2. Navigate to project: cd path\\to\\havenly-project");
    console.log("   3. Run: npm run setup:windows");
  } else {
    console.log("💡 On macOS/Linux, try: sudo npm run setup:unix");
  }

  process.exit(1);
}

// Step 8: Create server .env file
console.log("⚙️  Setting up server configuration...");
const serverEnvPath = path.join(serverPath, "config", ".env");
const serverEnvExample = path.join(serverPath, "config", ".env.example");

if (!fs.existsSync(path.join(serverPath, "config"))) {
  fs.mkdirSync(path.join(serverPath, "config"), { recursive: true });
}

if (fs.existsSync(serverEnvExample) && !fs.existsSync(serverEnvPath)) {
  fs.copyFileSync(serverEnvExample, serverEnvPath);
  console.log("✅ Server .env created from template");
  console.log("⚠️  IMPORTANT: Edit server/config/.env with your credentials\n");
} else if (fs.existsSync(serverEnvPath)) {
  console.log("✅ Server .env already exists\n");
} else {
  console.log("⚠️  No .env.example found in server/config\n");
}

// Step 9: Create necessary directories with src folder structure
console.log("📂 Creating server directories...");
const serverDirs = [
  "config",
  "public",
  "src/controllers",
  "src/models",
  "src/middleware",
  "src/routes",
  "src/services",
  "src/utils",
  "src/helpers",
  "database",
  "tests",
  "uploads",
  "uploads/properties",
  "uploads/tenants",
  "uploads/documents",
  "logs",
];

serverDirs.forEach((dir) => {
  const dirPath = path.join(serverPath, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   ✓ Created: server/${dir}/`);
  }
});

// Create .gitkeep in upload directories
const uploadDirs = [
  "uploads",
  "uploads/properties",
  "uploads/tenants",
  "uploads/documents",
];
uploadDirs.forEach((dir) => {
  const gitkeepPath = path.join(serverPath, dir, ".gitkeep");
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, "");
  }
});

console.log("✅ Server structure ready\n");

// Step 10: Generate JWT secret if needed
console.log("🔐 Checking JWT secret...");
if (fs.existsSync(serverEnvPath)) {
  let envContent = fs.readFileSync(serverEnvPath, "utf8");
  if (envContent.includes("JWT_SECRET=your-super-secret-key-change-this")) {
    const crypto = require("crypto");
    const newSecret = crypto.randomBytes(32).toString("hex");
    envContent = envContent.replace(
      "JWT_SECRET=your-super-secret-key-change-this",
      `JWT_SECRET=${newSecret}`
    );
    fs.writeFileSync(serverEnvPath, envContent);
    console.log("✅ Generated secure JWT secret\n");
  } else {
    console.log("✅ JWT secret already configured\n");
  }
}

// Final instructions
console.log("═══════════════════════════════════════════════════════");
console.log("✨ Modern Setup Complete! Next Steps:\n");
console.log("1. 🗄️  DATABASE SETUP:");
console.log("   - Start XAMPP Control Panel");
console.log("   - Start Apache and MySQL");
console.log("   - Open: http://localhost/phpmyadmin");
console.log("   - Create database: havenly_db");
console.log("   - Import: server/database/schema.sql");
console.log("\n2. ⚙️  CONFIGURE EMAIL (Optional):");
console.log("   - Edit: server/config/.env");
console.log("   - Add SMTP credentials for email notifications");
console.log("   - Tip: Use Mailtrap.io for development testing");
console.log("\n3. 🚀 START DEVELOPMENT:");
console.log("   Terminal 1 (Client):");
console.log("   → cd client");
console.log("   → npm start");
console.log("\n   Terminal 2 (Server):");
console.log("   → XAMPP running at http://localhost/havenly-api");
console.log("\n4. 🌐 ACCESS APPLICATION:");
console.log("   Frontend: http://localhost:3000");
console.log("   Backend:  http://localhost/havenly-api");
console.log("   phpMyAdmin: http://localhost/phpmyadmin");
console.log("\n5. 📁 NEW DIRECTORY STRUCTURE:");
console.log("   ✓ Controllers: server/src/controllers/");
console.log("   ✓ Models: server/src/models/");
console.log("   ✓ Middleware: server/src/middleware/");
console.log("   ✓ Routes: server/src/routes/");
console.log("   ✓ Services: server/src/services/");
console.log("\n6. 🔐 MODERN FEATURES READY:");
console.log("   ✓ JWT Authentication");
console.log("   ✓ Email Notifications (configure SMTP)");
console.log("   ✓ PDF Generation");
console.log("   ✓ File Uploads");
console.log("   ✓ Input Validation");
console.log("═══════════════════════════════════════════════════════\n");
console.log("💡 Need help? Check the README.md for troubleshooting\n");
