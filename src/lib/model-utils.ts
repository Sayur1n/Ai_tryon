/**
 * 解析身高输入，支持多种格式
 * @param heightInput 身高输入，如 "165", "165cm", "165CM", "1.65m", "1.65M"
 * @returns 标准化的身高字符串，如 "165cm"
 */
export function parseHeight(heightInput: string): string {
  if (!heightInput) return '';
  
  // 移除所有空格
  const cleaned = heightInput.trim();
  
  // 如果只包含数字，默认添加cm
  if (/^\d+(\.\d+)?$/.test(cleaned)) {
    return `${cleaned}cm`;
  }
  
  // 匹配各种格式
  const patterns = [
    // 165cm, 165CM, 165 cm, 165 CM
    /^(\d+(?:\.\d+)?)\s*(?:cm|CM)$/,
    // 1.65m, 1.65M, 1.65 m, 1.65 M
    /^(\d+(?:\.\d+)?)\s*(?:m|M)$/,
    // 165 (纯数字，默认cm)
    /^(\d+(?:\.\d+)?)$/
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      
      // 如果值小于10，可能是米制，转换为厘米
      if (value < 10) {
        return `${Math.round(value * 100)}cm`;
      }
      
      // 否则直接使用，添加cm单位
      return `${Math.round(value)}cm`;
    }
  }
  
  // 如果都不匹配，返回原值
  return cleaned;
}

/**
 * 解析体重输入，支持多种格式
 * @param weightInput 体重输入，如 "50", "50kg", "50KG", "50.5kg", "110lb", "110LB"
 * @returns 标准化的体重字符串，如 "50kg"
 */
export function parseWeight(weightInput: string): string {
  if (!weightInput) return '';
  
  // 移除所有空格
  const cleaned = weightInput.trim();
  
  // 如果只包含数字，默认添加kg
  if (/^\d+(\.\d+)?$/.test(cleaned)) {
    return `${cleaned}kg`;
  }
  
  // 匹配各种格式
  const patterns = [
    // 50kg, 50KG, 50 kg, 50 KG
    /^(\d+(?:\.\d+)?)\s*(?:kg|KG)$/,
    // 110lb, 110LB, 110 lb, 110 LB
    /^(\d+(?:\.\d+)?)\s*(?:lb|LB)$/,
    // 50 (纯数字，默认kg)
    /^(\d+(?:\.\d+)?)$/
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      
      // 如果是磅，转换为千克
      if (cleaned.toLowerCase().includes('lb')) {
        const kgValue = Math.round(value * 0.453592 * 10) / 10;
        return `${kgValue}kg`;
      }
      
      // 否则直接使用，添加kg单位
      return `${Math.round(value)}kg`;
    }
  }
  
  // 如果都不匹配，返回原值
  return cleaned;
}

/**
 * 验证模特信息的完整性
 */
export function validateModelData(data: {
  name: string;
  style: string;
  height: string;
  weight: string;
  body: string;
  image: string;
  gender: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name?.trim()) errors.push('姓名不能为空');
  if (!data.style?.trim()) errors.push('风格不能为空');
  if (!data.height?.trim()) errors.push('身高不能为空');
  if (!data.weight?.trim()) errors.push('体重不能为空');
  if (!data.body?.trim()) errors.push('身材不能为空');
  if (!data.image?.trim()) errors.push('图片不能为空');
  if (!['male', 'female'].includes(data.gender)) errors.push('性别必须是男性或女性');
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 