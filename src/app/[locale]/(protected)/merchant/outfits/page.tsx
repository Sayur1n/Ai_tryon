'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface OutfitData {
  id: string;
  modelImageUrl?: string;
  topImageUrl?: string;
  bottomImageUrl?: string;
  modelImageLink?: string;
  topImageLink?: string;
  bottomImageLink?: string;
  description?: string;
  sex: string;
  type: string;
  isDefault: string;
  createdAt: string;
  updatedAt: string;
}

// 上传图片到OSS
async function uploadImageToOSS(file: File, type: 'outfit'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

export default function MerchantOutfitsPage() {
  const t = useTranslations();
  const [outfits, setOutfits] = useState<OutfitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<OutfitData | null>(null);
  
  // 表单数据
  const [formData, setFormData] = useState({
    modelImageUrl: '',
    topImageUrl: '',
    bottomImageUrl: '',
    modelImageLink: '',
    topImageLink: '',
    bottomImageLink: '',
    description: '',
    sex: 'female',
    type: 'topbottom'
  });

  // 图片上传状态
  const [uploadingImages, setUploadingImages] = useState({
    model: false,
    top: false,
    bottom: false
  });

  // 获取服装列表
  const fetchOutfits = async () => {
    try {
      const response = await fetch('/api/merchant/outfits');
      if (response.ok) {
        const data = await response.json();
        setOutfits(data.outfits);
      } else {
        toast.error('获取服装列表失败');
      }
    } catch (error) {
      console.error('Error fetching outfits:', error);
      toast.error('获取服装列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  // 图片上传处理
  const handleImageUpload = async (file: File, type: 'model' | 'top' | 'bottom') => {
    setUploadingImages(prev => ({ ...prev, [type]: true }));
    try {
      const url = await uploadImageToOSS(file, 'outfit');
      setFormData(prev => ({
        ...prev,
        [`${type}ImageUrl`]: url
      }));
      toast.success('图片上传成功');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('图片上传失败');
    } finally {
      setUploadingImages(prev => ({ ...prev, [type]: false }));
    }
  };

  // 图片上传按钮组件
  const UploadButton = ({ 
    onChange, 
    label, 
    image, 
    uploading = false 
  }: { 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    label: string; 
    image?: string;
    uploading?: boolean;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    return (
      <div className="relative w-full">
        {image ? (
          <div
            className="relative w-full h-32 flex items-center justify-center border-2 border-solid border-primary/40 rounded-lg cursor-pointer overflow-hidden bg-white hover:opacity-90 transition"
            onClick={() => inputRef.current?.click()}
          >
            <Image src={image} alt={label} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 384px" />
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              已上传
            </div>
            <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={onChange} />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-solid border-primary/40 rounded-lg p-4 cursor-pointer hover:bg-primary/5 transition w-full h-32">
            {uploading ? (
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            ) : (
              <UploadCloud className="w-8 h-8 text-primary mb-2" />
            )}
            <span className="text-sm text-primary font-medium mb-1">{label}</span>
            <span className="text-xs text-muted-foreground mb-2">点击上传图片</span>
            <input type="file" accept="image/*" className="hidden" onChange={onChange} />
          </label>
        )}
      </div>
    );
  };

  // 保存服装
  const saveOutfit = async () => {
    if (!formData.topImageUrl || !formData.bottomImageUrl) {
      toast.error('请上传上衣和下衣图片');
      return;
    }

    try {
      const url = editingOutfit ? `/api/merchant/outfits/${editingOutfit.id}` : '/api/merchant/outfits';
      const method = editingOutfit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingOutfit ? '服装更新成功' : '服装添加成功');
        setShowAddDialog(false);
        setEditingOutfit(null);
        setFormData({
          modelImageUrl: '',
          topImageUrl: '',
          bottomImageUrl: '',
          modelImageLink: '',
          topImageLink: '',
          bottomImageLink: '',
          description: '',
          sex: 'female',
          type: 'topbottom'
        });
        fetchOutfits();
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      console.error('Error saving outfit:', error);
      toast.error('操作失败');
    }
  };

  // 删除服装
  const deleteOutfit = async (id: string) => {
    if (!confirm('确定要删除这个服装吗？')) return;
    
    try {
      const response = await fetch(`/api/merchant/outfits/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('服装删除成功');
        fetchOutfits();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      console.error('Error deleting outfit:', error);
      toast.error('删除失败');
    }
  };

  // 编辑服装
  const editOutfit = (outfit: OutfitData) => {
    setEditingOutfit(outfit);
    setFormData({
      modelImageUrl: outfit.modelImageUrl || '',
      topImageUrl: outfit.topImageUrl || '',
      bottomImageUrl: outfit.bottomImageUrl || '',
      modelImageLink: outfit.modelImageLink || '',
      topImageLink: outfit.topImageLink || '',
      bottomImageLink: outfit.bottomImageLink || '',
      description: outfit.description || '',
      sex: outfit.sex,
      type: outfit.type
    });
    setShowAddDialog(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      modelImageUrl: '',
      topImageUrl: '',
      bottomImageUrl: '',
      modelImageLink: '',
      topImageLink: '',
      bottomImageLink: '',
      description: '',
      sex: 'female',
      type: 'topbottom'
    });
    setEditingOutfit(null);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和添加按钮 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">服装管理</h1>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加服装
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOutfit ? '编辑服装' : '添加服装'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>性别</Label>
                  <Select value={formData.sex} onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">女装</SelectItem>
                      <SelectItem value="male">男装</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>类型</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topbottom">上下装</SelectItem>
                      <SelectItem value="onesuit">连体装</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 图片上传 */}
              <div className="space-y-4">
                <Label>图片上传</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">模特图片（可选）</Label>
                    <UploadButton
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'model');
                      }}
                      label="上传模特图片"
                      image={formData.modelImageUrl}
                      uploading={uploadingImages.model}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">上衣图片</Label>
                    <UploadButton
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'top');
                      }}
                      label="上传上衣图片"
                      image={formData.topImageUrl}
                      uploading={uploadingImages.top}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">下衣图片</Label>
                    <UploadButton
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'bottom');
                      }}
                      label="上传下衣图片"
                      image={formData.bottomImageUrl}
                      uploading={uploadingImages.bottom}
                    />
                  </div>
                </div>
              </div>

              {/* 商品链接 */}
              <div className="space-y-4">
                <Label>商品链接（可选）</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">模特链接</Label>
                    <Input
                      placeholder="模特商品链接"
                      value={formData.modelImageLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, modelImageLink: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">上衣链接</Label>
                    <Input
                      placeholder="上衣商品链接"
                      value={formData.topImageLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, topImageLink: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">下衣链接</Label>
                    <Input
                      placeholder="下衣商品链接"
                      value={formData.bottomImageLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, bottomImageLink: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <div>
                <Label>描述</Label>
                <Textarea
                  placeholder="服装描述"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}>
                  取消
                </Button>
                <Button onClick={saveOutfit}>
                  {editingOutfit ? '更新' : '添加'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 服装列表 */}
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {outfits.map((outfit) => (
            <Card key={outfit.id} className="overflow-hidden shadow-md rounded-xl relative group">
              <CardContent className="p-0 flex flex-col h-72 relative bg-white rounded-xl">
                {/* 右上角性别标签 */}
                <span className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded shadow z-10">
                  {outfit.sex === 'male' ? '男装' : '女装'}
                </span>

                {/* 图片展示区域 */}
                <div className="flex-1 flex">
                  {/* 主图区域（模特图或上衣图） */}
                  <div className="flex-1 relative">
                    {outfit.modelImageUrl ? (
                      <Image
                        src={outfit.modelImageUrl}
                        alt="模特图片"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain rounded-l-xl"
                      />
                    ) : outfit.topImageUrl ? (
                      <Image
                        src={outfit.topImageUrl}
                        alt="上衣图片"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain rounded-l-xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-l-xl">
                        <div className="text-center text-gray-400">
                          <div className="text-2xl mb-2">👗</div>
                          <div className="text-sm">无图片</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 侧边图片区域 */}
                  <div className="w-32 flex flex-col items-center justify-center gap-4 border-l">
                    {/* 当有模特图时，显示上衣和下衣 */}
                    {outfit.modelImageUrl && outfit.topImageUrl && (
                      <div className="w-20 h-20 relative border rounded-md bg-gray-50 overflow-hidden">
                        <Image 
                          src={outfit.topImageUrl} 
                          alt="上衣" 
                          fill 
                          sizes="80px" 
                          className="object-contain" 
                        />
                      </div>
                    )}
                    {/* 当有模特图时，显示下衣 */}
                    {outfit.modelImageUrl && outfit.bottomImageUrl && (
                      <div className="w-20 h-20 relative border rounded-md bg-gray-50 overflow-hidden">
                        <Image 
                          src={outfit.bottomImageUrl} 
                          alt="下衣" 
                          fill 
                          sizes="80px" 
                          className="object-contain" 
                        />
                      </div>
                    )}
                    {/* 当没有模特图时，只显示下衣（上衣已经在主图区域） */}
                    {!outfit.modelImageUrl && outfit.bottomImageUrl && (
                      <div className="w-20 h-20 relative border rounded-md bg-gray-50 overflow-hidden">
                        <Image 
                          src={outfit.bottomImageUrl} 
                          alt="下衣" 
                          fill 
                          sizes="80px" 
                          className="object-contain" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 底部栏 */}
                <div className="px-4 py-3 border-t bg-white rounded-b-xl">
                  {/* 描述 */}
                  <div className={`text-xs mb-3 p-2 rounded border max-h-12 overflow-hidden min-h-[2rem] ${
                    outfit.description 
                      ? 'text-gray-600 bg-gray-50 border-gray-200' 
                      : 'text-transparent bg-transparent border-transparent'
                  }`}>
                    {outfit.description ? (
                      <>
                        <strong>描述:</strong> {outfit.description}
                      </>
                    ) : (
                      <div>占位</div>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editOutfit(outfit)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteOutfit(outfit.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && outfits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👗</div>
          <p className="text-muted-foreground text-lg">暂无服装数据</p>
          <p className="text-muted-foreground text-sm">点击上方按钮添加第一个服装</p>
        </div>
      )}
    </div>
  );
} 