'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, UploadCloud, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Model {
  id: string;
  name: string;
  style: string;
  height: string;
  weight: string;
  body: string;
  image: string;
  selected: string;
  isCustom: string;
  gender?: string;
  userId?: string;
}

// 上传图片到OSS
async function uploadImageToOSS(file: File, type: 'model'): Promise<string> {
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

export default function MerchantModelsPage() {
  const t = useTranslations();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelFilter, setModelFilter] = useState<'all' | 'male' | 'female'>('all');
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    style: '',
    height: '',
    weight: '',
    body: '',
    image: '',
    gender: 'female'
  });

  // 图片上传状态
  const [uploadingImage, setUploadingImage] = useState(false);

  // 删除确认对话框
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);

  // 获取模特列表
  const fetchModels = async () => {
    try {
      const response = await fetch('/api/custom-model');
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      } else {
        toast.error('获取模特列表失败');
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('获取模特列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // 图片上传处理
  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const url = await uploadImageToOSS(file, 'model');
      setFormData(prev => ({
        ...prev,
        image: url
      }));
      toast.success('图片上传成功');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('图片上传失败');
    } finally {
      setUploadingImage(false);
    }
  };

  // 图片上传按钮组件
  const ModelUploadButton = ({ 
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

  // 保存模特
  const saveModel = async () => {
    if (!formData.name || !formData.style || !formData.height || !formData.weight || !formData.body || !formData.image) {
      toast.error('请填写所有必填字段并上传图片');
      return;
    }

    try {
      const url = editingModel ? `/api/custom-model/${editingModel.id}` : '/api/custom-model';
      const method = editingModel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          style: formData.style,
          height: formData.height,
          weight: formData.weight,
          body: formData.body,
          image: formData.image,
          gender: formData.gender,
          isCustom: 'false', // 商户添加的模特为默认模特
        }),
      });

      if (response.ok) {
        toast.success(editingModel ? '模特更新成功' : '模特添加成功');
        setShowAddDialog(false);
        setEditingModel(null);
        setFormData({
          name: '',
          style: '',
          height: '',
          weight: '',
          body: '',
          image: '',
          gender: 'female'
        });
        fetchModels();
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error('操作失败');
    }
  };

  // 删除模特
  const deleteModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/custom-model/${modelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('模特删除成功');
        setModels(prev => prev.filter(model => model.id !== modelId));
        setShowDeleteConfirm(false);
        setModelToDelete(null);
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('删除失败');
    }
  };

  // 编辑模特
  const editModel = (model: Model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      style: model.style,
      height: model.height,
      weight: model.weight,
      body: model.body,
      image: model.image,
      gender: model.gender || 'female'
    });
    setShowAddDialog(true);
  };

  // 显示删除确认对话框
  const showDeleteConfirmDialog = (model: Model) => {
    setModelToDelete(model);
    setShowDeleteConfirm(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      style: '',
      height: '',
      weight: '',
      body: '',
      image: '',
      gender: 'female'
    });
    setEditingModel(null);
  };

  // 筛选模特 - 商户只能看到默认模特，不显示自定义筛选
  const filteredModels = models.filter(model => {
    if (modelFilter === 'all') return true;
    if (modelFilter === 'male') return model.gender === 'male';
    if (modelFilter === 'female') return model.gender === 'female';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题和添加按钮 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">模特管理</h1>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加模特
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingModel ? '编辑模特' : '添加模特'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>姓名</Label>
                  <Input
                    placeholder="模特姓名"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>性别</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">女性</SelectItem>
                      <SelectItem value="male">男性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>风格</Label>
                  <Input
                    placeholder="模特风格"
                    value={formData.style}
                    onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>身高</Label>
                  <Input
                    placeholder="身高 (cm)"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>体重</Label>
                  <Input
                    placeholder="体重 (kg)"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>体型</Label>
                <Input
                  placeholder="体型描述"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                />
              </div>

              {/* 图片上传 */}
              <div>
                <Label>模特图片</Label>
                <ModelUploadButton
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  label="上传模特图片"
                  image={formData.image}
                  uploading={uploadingImage}
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
                <Button onClick={saveModel}>
                  {editingModel ? '更新' : '添加'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 筛选按钮 */}
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            modelFilter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setModelFilter('all')}
        >
          全部
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            modelFilter === 'female' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setModelFilter('female')}
        >
          女性
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            modelFilter === 'male' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setModelFilter('male')}
        >
          男性
        </button>
      </div>

      {/* 模特列表 */}
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredModels.map((model) => (
            <Card key={model.id} className="overflow-hidden shadow-md rounded-xl relative group">
              <CardContent className="p-0 flex flex-col h-80 relative bg-white rounded-xl">
                {/* 右上角标签 */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded shadow">
                    {model.gender === 'male' ? '男' : '女'}
                  </span>
                </div>

                {/* 图片区域 */}
                <div className="flex-1 relative">
                  <Image
                    src={model.image}
                    alt={model.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain rounded-t-xl"
                  />
                </div>

                {/* 信息区域 */}
                <div className="px-4 py-3 bg-white rounded-b-xl">
                  <div className="mb-3">
                    <h3 className="font-semibold text-base mb-1">{model.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{model.style}</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>身高: {model.height}cm</div>
                      <div>体重: {model.weight}kg</div>
                      <div>体型: {model.body}</div>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editModel(model)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showDeleteConfirmDialog(model)}
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
      {!loading && filteredModels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-muted-foreground text-lg">暂无模特数据</p>
          <p className="text-muted-foreground text-sm">点击上方按钮添加第一个模特</p>
        </div>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>确定要删除模特 "{modelToDelete?.name}" 吗？</p>
            <p className="text-sm text-muted-foreground">此操作无法撤销。</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                取消
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => modelToDelete && deleteModel(modelToDelete.id)}
              >
                删除
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 