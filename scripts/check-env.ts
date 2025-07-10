#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

// 加载 .env 文件
config({ path: resolve(process.cwd(), '.env') });

/**
 * 检查环境变量
 */
function checkEnvironmentVariables() {
  console.log('🔍 环境变量检查');
  console.log('=' .repeat(40));
  
  // 检查 .env 文件
  const envPath = resolve(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);
  
  console.log(`📄 .env 文件: ${envExists ? '✅ 存在' : '❌ 不存在'}`);
  
  if (envExists) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    const envVars = lines
      .filter((line: string) => line.trim() && !line.startsWith('#'))
      .map((line: string) => {
        const [key] = line.split('=');
        return key.trim();
      });
    
    console.log(`📊 找到 ${envVars.length} 个环境变量`);
    console.log('环境变量列表:');
    envVars.forEach((key: string) => {
      console.log(`  - ${key}`);
    });
  }
  
  console.log('\n🔧 关键环境变量状态:');
  
  const requiredVars = [
    'RESEND_API_KEY',
    'RESEND_AUDIENCE_ID',
    'NEXT_PUBLIC_BASE_URL',
    'DATABASE_URL',
    'BETTER_AUTH_SECRET'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅ 已设置' : '❌ 未设置';
    const preview = value ? `${value.substring(0, 10)}...` : '';
    console.log(`  ${varName}: ${status} ${preview}`);
  });
  
  console.log('\n💡 建议:');
  if (!process.env.RESEND_API_KEY) {
    console.log('  - 设置 RESEND_API_KEY 以启用邮件功能');
  }
  if (!process.env.RESEND_AUDIENCE_ID) {
    console.log('  - 设置 RESEND_AUDIENCE_ID 以启用邮件列表功能');
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    console.log('  - 设置 NEXT_PUBLIC_BASE_URL 以配置应用基础URL');
  }
  
  console.log('\n🚀 运行测试:');
  console.log('  npm run test-email-with-env');
}

// 运行检查
checkEnvironmentVariables(); 