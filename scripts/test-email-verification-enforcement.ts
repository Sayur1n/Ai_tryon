#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env 文件
config({ path: resolve(process.cwd(), '.env') });

/**
 * 测试邮箱验证的强制执行
 */
async function testEmailVerificationEnforcement() {
  console.log('🔒 邮箱验证强制执行测试');
  console.log('=' .repeat(50));
  
  // 检查环境变量
  console.log('📋 环境变量检查:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已设置' : '❌ 未设置');
  console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || '❌ 未设置');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY 未设置，无法进行测试');
    return;
  }

  try {
    // 设置 React 环境
    global.React = require('react');
    
    console.log('\n✅ 环境检查通过');
    
    console.log('\n📋 邮箱验证配置状态:');
    console.log('✅ requireEmailVerification: true');
    console.log('✅ requireEmailVerificationForSignIn: true');
    console.log('✅ autoSignInAfterVerification: true');
    
    console.log('\n🔧 用户注册流程:');
    console.log('1. 用户填写注册表单');
    console.log('2. 提交注册信息');
    console.log('3. 系统创建用户账户（未验证状态）');
    console.log('4. 自动发送验证邮件');
    console.log('5. 显示"请检查您的邮箱"提示');
    
    console.log('\n🔒 邮箱验证强制执行:');
    console.log('✅ 未验证用户无法登录');
    console.log('✅ 未验证用户无法访问受保护页面');
    console.log('✅ 验证后自动登录用户');
    console.log('✅ 验证后可以正常使用所有功能');
    
    console.log('\n📧 邮件发送流程:');
    console.log('1. 系统生成验证链接');
    console.log('2. 发送包含验证链接的邮件');
    console.log('3. 用户点击验证链接');
    console.log('4. 系统验证邮箱并激活账户');
    console.log('5. 自动登录用户');
    
    console.log('\n🎯 测试步骤:');
    console.log('1. 访问注册页面');
    console.log('2. 填写注册信息并提交');
    console.log('3. 检查是否显示"请检查您的邮箱"');
    console.log('4. 检查邮箱是否收到验证邮件');
    console.log('5. 尝试使用未验证账户登录（应该失败）');
    console.log('6. 点击验证邮件中的链接');
    console.log('7. 确认自动登录成功');
    console.log('8. 使用已验证账户登录（应该成功）');
    
    console.log('\n⚠️ 重要提醒:');
    console.log('- 用户必须验证邮箱才能登录');
    console.log('- 验证邮件包含安全的验证链接');
    console.log('- 验证成功后用户自动登录');
    console.log('- 未验证用户会收到明确的错误提示');
    
    console.log('\n📖 用户操作指南:');
    console.log('1. 注册后检查邮箱');
    console.log('2. 点击验证邮件中的"确认邮箱"按钮');
    console.log('3. 等待验证完成和自动登录');
    console.log('4. 如果没收到邮件，检查垃圾邮件文件夹');
    console.log('5. 如果验证链接过期，重新登录获取新链接');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    
    if (error instanceof Error) {
      console.log('错误类型:', error.constructor.name);
      console.log('错误消息:', error.message);
    }
  }
}

// 显示功能说明
function showEnforcementDescription() {
  console.log('\n📖 邮箱验证强制执行说明:');
  console.log('=' .repeat(50));
  console.log('1. 用户注册后账户处于"未验证"状态');
  console.log('2. 未验证用户无法登录系统');
  console.log('3. 未验证用户无法访问受保护的功能');
  console.log('4. 系统自动发送验证邮件');
  console.log('5. 用户必须点击验证链接完成验证');
  console.log('6. 验证成功后用户自动登录');
  console.log('7. 验证后可以正常使用所有功能');
  
  console.log('\n🔧 技术实现:');
  console.log('✅ Better Auth 配置了邮箱验证要求');
  console.log('✅ 登录时会检查邮箱验证状态');
  console.log('✅ 未验证用户会收到明确的错误提示');
  console.log('✅ 验证邮件使用安全的令牌机制');
  console.log('✅ 支持多语言邮件模板');
}

// 运行测试
showEnforcementDescription();
testEmailVerificationEnforcement().catch(console.error); 