import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';

const ssh = new NodeSSH();

async function run() {
  console.log("Connecting to server 168.144.84.190...");
  await ssh.connect({
    host: '168.144.84.190',
    username: 'root',
    password: '1BuildForBng',
    tryKeyboard: true,
  });
  console.log("Connected successfully! Preparing server...");
  
  const localDir = process.cwd();
  const remoteDir = '/opt/sutra-app-source';
  
  await ssh.execCommand(`mkdir -p ${remoteDir}`);
  
  console.log("Uploading project files (this may take a minute)...");
  
  const failed = [];
  const successful = [];
  await ssh.putDirectory(localDir, remoteDir, {
    recursive: true,
    concurrency: 10,
    validate: function(itemPath) {
      const baseName = path.basename(itemPath);
      return baseName !== 'node_modules' && baseName !== '.git' && baseName !== 'dist';
    },
    tick: function(localPath, remotePath, error) {
      if (error) {
        failed.push(localPath);
      } else {
        successful.push(localPath);
      }
    }
  });
  
  console.log(`Successfully uploaded ${successful.length} files. Failed to upload: ${failed.length} files.`);
  if (failed.length > 0) {
    console.error("Some files failed to upload:", failed);
  }
  
  console.log("Starting remote deployment script (deploy.sh)...");
  console.log("-------------------------------------------------");
  
  const result = await ssh.execCommand('chmod +x deploy.sh && ./deploy.sh', {
    cwd: remoteDir,
    stream: 'both',
    onStdout(chunk) {
      process.stdout.write(chunk.toString('utf8'));
    },
    onStderr(chunk) {
      process.stderr.write(chunk.toString('utf8'));
    }
  });
  
  console.log("-------------------------------------------------");
  console.log("Deployment execution finished with code " + result.code);
  
  ssh.dispose();
}

run().catch(err => {
  console.error("Deployment failed:", err);
  ssh.dispose();
});
