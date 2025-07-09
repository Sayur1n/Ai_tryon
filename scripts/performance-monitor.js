#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始性能监控...\n');

// 记录开始时间
const startTime = Date.now();

try {
  // 清理之前的构建
  console.log('🧹 清理之前的构建...');
  execSync('rm -rf .next', { stdio: 'inherit' });
  
  // 开始构建
  console.log('🔨 开始构建...');
  const buildStartTime = Date.now();
  execSync('npm run build', { stdio: 'inherit' });
  const buildEndTime = Date.now();
  
  // 计算构建时间
  const buildTime = buildEndTime - buildStartTime;
  const totalTime = Date.now() - startTime;
  
  console.log('\n📊 性能报告:');
  console.log(`构建时间: ${buildTime}ms (${(buildTime / 1000).toFixed(2)}s)`);
  console.log(`总时间: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
  
  // 保存性能数据
  const performanceData = {
    timestamp: new Date().toISOString(),
    buildTime,
    totalTime,
    buildTimeSeconds: (buildTime / 1000).toFixed(2),
    totalTimeSeconds: (totalTime / 1000).toFixed(2)
  };
  
  const performanceFile = path.join(__dirname, '../performance-log.json');
  let logs = [];
  
  if (fs.existsSync(performanceFile)) {
    logs = JSON.parse(fs.readFileSync(performanceFile, 'utf8'));
  }
  
  logs.push(performanceData);
  fs.writeFileSync(performanceFile, JSON.stringify(logs, null, 2));
  
  console.log(`\n✅ 性能数据已保存到: ${performanceFile}`);
  
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
} 