"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Plus, UploadCloud, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";

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
type ClothType = "topbottom" | "onesuit";

export default function OutfitRoomPage() {
  const t = useTranslations("OutfitRoom");
  const searchParams = useSearchParams();
  
  // 模特列表
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [customModels, setCustomModels] = useState<Model[]>([]);
  // 模特选择弹窗
  const [showModelSelect, setShowModelSelect] = useState(false);
  // 新增模特弹窗
  const [showAddModel, setShowAddModel] = useState(false);
  const [addModelData, setAddModelData] = useState<Partial<Model>>({});
  const [addModelImage, setAddModelImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 服装类型
  const [clothType, setClothType] = useState<ClothType>("topbottom");
  // 上传服装图片
  const [topImage, setTopImage] = useState<string>("");
  const [bottomImage, setBottomImage] = useState<string>("");
  const [onesuitImage, setOnesuitImage] = useState<string>("");
  // 试衣流程
  const [isTrying, setIsTrying] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  // 模特筛选
  const [modelFilter, setModelFilter] = useState<'all' | 'male' | 'female'>('all');

  // 上传图片到OSS
  async function uploadImageToOSS(file: File, type: 'model' | 'cloth'): Promise<string> {
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
  // 新建模特图片上传
  async function handleAddModelImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAddModelImage('');
      try {
        const url = await uploadImageToOSS(file, 'model');
        setAddModelImage(url);
      } catch (err) {
        alert('图片上传失败');
      }
    }
  }
  // 新增模特确认
  async function handleAddModelConfirm() {
    if (!addModelData.name || !addModelData.style || !addModelData.height || !addModelData.weight || !addModelData.body || !addModelImage) return;
    
    try {
      // 保存到数据库
      const response = await fetch('/api/custom-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addModelData.name,
          style: addModelData.style,
          height: addModelData.height,
          weight: addModelData.weight,
          body: addModelData.body,
          image: addModelImage,
          gender: addModelData.gender || 'female', // 默认女性
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newModel: Model = {
          id: data.model.id,
          name: addModelData.name!,
          style: addModelData.style!,
          height: addModelData.height!,
          weight: addModelData.weight!,
          body: addModelData.body!,
          image: addModelImage,
          selected: "false",
          isCustom: "true",
          gender: addModelData.gender || 'female'
        };
        
        // 更新模特列表
        setModels(prev => [...prev, newModel]);
        setCustomModels(prev => [...prev, newModel]);
        
        setShowAddModel(false);
        setAddModelData({});
        setAddModelImage("");
      } else {
        alert('保存模特失败');
      }
    } catch (error) {
      console.error('Error saving custom model:', error);
      alert('保存模特失败');
    }
  }
  // 上传服装图片
  async function handleClothImage(e: React.ChangeEvent<HTMLInputElement>, type: "top" | "bottom" | "onesuit") {
    const file = e.target.files?.[0];
    if (file) {
      const ossType = type === 'onesuit' ? 'cloth' : 'cloth';
      try {
        const url = await uploadImageToOSS(file, ossType);
        if (type === "top") setTopImage(url);
        if (type === "bottom") setBottomImage(url);
        if (type === "onesuit") setOnesuitImage(url);
      } catch (err) {
        alert('图片上传失败');
      }
    }
  }
  const currentUser = useCurrentUser();

  // 获取所有模特数据（默认模特所有人可见，自定义模特仅对应用户可见）
  async function fetchAllModels() {
    try {
      const response = await fetch('/api/custom-model');
      if (response.ok) {
        const data = await response.json();
        console.log('API返回的原始数据:', data);
        
        const allModelsData = data.models.map((model: any) => ({
          id: model.id,
          name: model.name,
          style: model.style,
          height: model.height,
          weight: model.weight,
          body: model.body,
          image: model.image,
          selected: model.selected || 'false',
          isCustom: model.isCustom || 'true',
          gender: model.gender,
          userId: model.userId
        }));
        
        console.log('处理后的模特数据:', allModelsData);
        console.log('当前用户ID:', currentUser?.id);
        
        // 分离默认模特和自定义模特
        const defaultModels = allModelsData.filter((model: Model) => model.isCustom === 'false');
        const userCustomModels = allModelsData.filter((model: Model) => 
          model.isCustom === 'true' && model.userId === currentUser?.id
        );
        
        console.log('默认模特:', defaultModels);
        console.log('用户自定义模特:', userCustomModels);
        
        setCustomModels(userCustomModels);
        setModels([...defaultModels, ...userCustomModels]);
        
        // 如果没有选中的模特，选择第一个默认模特
        if (!selectedModel && defaultModels.length > 0) {
          setSelectedModel(defaultModels[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  }

  // 页面加载时获取所有模特
  useEffect(() => {
    if (currentUser?.id) {
      fetchAllModels();
    }
  }, [currentUser?.id]);

  // 处理URL参数，预填充衣服图片
  useEffect(() => {
    const topImageParam = searchParams.get('topImage');
    const bottomImageParam = searchParams.get('bottomImage');
    const clothTypeParam = searchParams.get('clothType') as ClothType;
    const sexParam = searchParams.get('sex');

    // 设置服装类型
    if (clothTypeParam) {
      setClothType(clothTypeParam);
    }

    // 预填充衣服图片
    if (topImageParam) {
      setTopImage(topImageParam);
    }
    if (bottomImageParam) {
      setBottomImage(bottomImageParam);
    }
    if (clothTypeParam === 'onesuit' && topImageParam) {
      setOnesuitImage(topImageParam);
    }

    // 根据性别选择默认模特
    if (sexParam && models.length > 0) {
      const defaultModel = models.find(model => model.gender === sexParam) || models[0];
      setSelectedModel(defaultModel);
      // 设置筛选器
      setModelFilter(sexParam as 'male' | 'female');
    }
  }, [searchParams, models]);

  // 根据筛选器获取显示的模特列表
  const filteredModels = models.filter(model => {
    if (modelFilter === 'all') return true;
    return model.gender === modelFilter;
  });

  // 开始试衣服
  async function handleTryon() {
    if (!selectedModel) {
      alert('请先选择模特');
      return;
    }

    // 检查是否有上传的服装图片
    if (clothType === 'topbottom' && (!topImage || !bottomImage)) {
      alert('请先上传上装和下装图片');
      return;
    }
    if (clothType === 'onesuit' && !onesuitImage) {
      alert('请先上传连体服装图片');
      return;
    }

    setIsTrying(true);
    
    try {
      // 准备请求参数
      const requestBody: any = {
        personImageUrl: selectedModel.image,
      };

      if (clothType === 'topbottom') {
        requestBody.topGarmentUrl = topImage;
        requestBody.bottomGarmentUrl = bottomImage;
      } else {
        // 连体服装作为上装处理
        requestBody.topGarmentUrl = onesuitImage;
      }

      console.log('开始AI试衣，参数:', requestBody);

      const response = await fetch('/api/ai-tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        // 保存生成的图片URL
        setGeneratedImage(data.imageUrl);
        console.log('AI试衣成功，结果图片:', data.imageUrl);
      } else {
        console.error('AI试衣失败:', data.error);
        alert(`试衣失败: ${data.error}`);
      }
    } catch (error) {
      console.error('AI试衣请求失败:', error);
      alert('试衣请求失败，请稍后重试');
    } finally {
      setIsTrying(false);
    }
  }

  // 上传按钮美化
  function UploadButton({ onChange, label, image }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; image?: string }) {
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
              预填充
            </div>
            <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={onChange} />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-solid border-primary/40 rounded-lg p-4 cursor-pointer hover:bg-primary/5 transition w-full h-32">
            <UploadCloud className="w-8 h-8 text-primary mb-2" />
            <span className="text-sm text-primary font-medium mb-1">{label}</span>
            <span className="text-xs text-muted-foreground mb-2">{t('upload.tip')}</span>
            <input type="file" accept="image/*" className="hidden" onChange={onChange} />
          </label>
        )}
      </div>
    );
  }

  // 新建模特图片上传按钮复用UploadButton
  function ModelUploadButton({ onChange, label, image }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; image?: string }) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="relative w-full">
        {image ? (
          <div
            className="relative w-full h-32 flex items-center justify-center border-2 border-solid border-primary/40 rounded-lg cursor-pointer overflow-hidden bg-white hover:opacity-90 transition"
            onClick={() => inputRef.current?.click()}
          >
            <Image src={image} alt={label} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 384px" />
            <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={onChange} />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-solid border-primary/40 rounded-lg p-4 cursor-pointer hover:bg-primary/5 transition w-full h-32">
            <UploadCloud className="w-8 h-8 text-primary mb-2" />
            <span className="text-sm text-primary font-medium mb-1">{label}</span>
            <span className="text-xs text-muted-foreground mb-2">{t('upload.tip')}</span>
            <input type="file" accept="image/*" className="hidden" onChange={onChange} />
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[600px]">
      {/* 左侧操作面板 */}
      <aside className="w-96 bg-white border-r p-6 flex-shrink-0 flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">{t('sidebar')}</h2>
          {/* 已选模特卡片 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{t('model.selected')}</span>
              <button
                className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition text-xs"
                onClick={() => setShowModelSelect(true)}
              >
                <CheckCircle2 className="w-4 h-4" /> {t('model.selectBtn')}
              </button>
            </div>
            {selectedModel ? (
              <div
                className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50 cursor-pointer hover:bg-primary/10 transition"
                onClick={() => setShowModelSelect(true)}
              >
                <div className="w-12 h-16 relative">
                  <Image src={selectedModel.image} alt={selectedModel.name} fill className="object-contain rounded" sizes="48px" />
                </div>
                <div>
                  <div className="font-semibold text-base">{selectedModel.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedModel.style}</div>
                </div>
              </div>
            ) : <div className="text-muted-foreground text-sm">{t('model.noSelected')}</div>}
          </div>
        </div>
        {/* 服装类型选择 */}
        <div>
          <div className="font-semibold mb-2">{t('cloth.type')}</div>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="clothType" checked={clothType === 'topbottom'} onChange={() => setClothType('topbottom')} />
              {t('cloth.topbottom')}
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="clothType" checked={clothType === 'onesuit'} onChange={() => setClothType('onesuit')} />
              {t('cloth.onesuit')}
            </label>
          </div>
          {/* 上传服装图片 */}
          {clothType === 'topbottom' ? (
            <div className="flex flex-col gap-2">
              <UploadButton onChange={e => handleClothImage(e, 'top')} label={t('cloth.top')} image={topImage} />
              <UploadButton onChange={e => handleClothImage(e, 'bottom')} label={t('cloth.bottom')} image={bottomImage} />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <UploadButton onChange={e => handleClothImage(e, 'onesuit')} label={t('cloth.onesuit')} image={onesuitImage} />
            </div>
          )}
        </div>
        {/* 开始试衣服按钮 */}
        <button
          className="mt-6 w-full py-2 bg-primary text-white rounded font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
          onClick={handleTryon}
          disabled={isTrying || !selectedModel || (clothType === 'topbottom' ? !(topImage && bottomImage) : !onesuitImage)}
        >
          <UploadCloud className="w-5 h-5" /> {t('start')}
        </button>
      </aside>
      {/* 右侧展示区 */}
      <main className="flex-1 flex items-center justify-center bg-gray-50 relative">
        {isTrying ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-lg font-semibold text-primary">{t('generating')}</div>
          </div>
        ) : generatedImage ? (
          <div className="flex flex-col items-center gap-4 w-full h-full p-8">
            <div className="text-xl font-bold text-primary mb-4">{t('result.title')}</div>
            <div className="relative w-full max-w-md h-96 bg-white rounded-lg shadow-lg overflow-hidden">
              <Image 
                src={generatedImage} 
                alt="AI试衣结果" 
                fill 
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 384px"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                onClick={() => setGeneratedImage("")}
              >
                {t('result.tryAgain')}
              </button>
              <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                onClick={() => {
                  // 这里可以添加下载图片的逻辑
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = `ai-tryon-${Date.now()}.jpg`;
                  link.click();
                }}
              >
                {t('result.download')}
              </button>
            </div>
          </div>
        ) : showModelSelect ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80">
            <div className="max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col p-0">
              <div className="px-8 pt-8 pb-4 border-b">
                <h3 className="text-xl font-bold">{t('model.selectTitle')}</h3>
                {/* 模特筛选选项 */}
                <div className="flex gap-4 mt-4">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      modelFilter === 'all' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setModelFilter('all')}
                  >
                    {t('filters.all')}
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      modelFilter === 'female' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setModelFilter('female')}
                  >
                    {t('model.female')}
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      modelFilter === 'male' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setModelFilter('male')}
                  >
                    {t('model.male')}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredModels.map((m) => (
                    <button
                      key={m.id}
                      className={`border rounded-xl p-4 flex flex-col items-center w-56 shadow-sm hover:shadow-lg transition bg-white relative ${selectedModel?.id === m.id ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}`}
                      onClick={() => setSelectedModel(m)}
                    >
                      <div className="w-24 h-32 relative mb-2">
                        <Image src={m.image} alt={m.name} fill className="object-contain rounded" sizes="96px" />
                      </div>
                      <div className="font-bold text-lg mb-1">{m.name}</div>
                      <div className="text-sm text-muted-foreground mb-1">{m.style}</div>
                      <div className="text-xs text-gray-500">
                        {t('model.height')}: <span className="font-medium text-gray-700">{m.height}</span><br />
                        {t('model.weight')}: <span className="font-medium text-gray-700">{m.weight}</span><br />
                        {t('model.body')}: <span className="font-medium text-gray-700">{m.body}</span>
                      </div>
                      {selectedModel?.id === m.id && <CheckCircle2 className="w-6 h-6 text-primary absolute top-2 right-2" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 justify-end px-8 py-4 border-t bg-white rounded-b-2xl">
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded bg-primary text-white font-bold text-lg hover:bg-primary/90 transition"
                  onClick={() => setShowModelSelect(false)}
                  disabled={!selectedModel}
                >
                  <CheckCircle2 className="w-5 h-5" /> {t('model.confirmSelect')}
                </button>
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded bg-gray-200 text-gray-700 font-bold text-lg hover:bg-gray-300 transition"
                  onClick={() => setShowModelSelect(false)}
                >
                  {t('cancel')}
                </button>
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded bg-primary/10 text-primary font-bold text-lg hover:bg-primary/20 transition"
                  onClick={() => { setShowModelSelect(false); setShowAddModel(true); }}
                >
                  <Plus className="w-5 h-5" /> {t('model.add')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-xl">{t('display.placeholder')}</div>
        )}
        {/* 新增模特弹窗 */}
        {showAddModel && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button className="absolute right-4 top-4 text-xl" onClick={() => setShowAddModel(false)}>×</button>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />{t('model.addTitle')}</h3>
                              <div className="flex flex-col gap-3">
                  <label className="block text-sm font-medium">{t('model.image')}</label>
                  <ModelUploadButton onChange={handleAddModelImage} label={t('upload.img')} image={addModelImage} />
                  <label className="block text-sm font-medium">{t('model.name')}</label>
                <input className="border rounded px-2 py-1" value={addModelData.name || ''} onChange={e => setAddModelData(d => ({ ...d, name: e.target.value }))} />
                <label className="block text-sm font-medium">{t('model.style')}</label>
                <input className="border rounded px-2 py-1" value={addModelData.style || ''} onChange={e => setAddModelData(d => ({ ...d, style: e.target.value }))} />
                <label className="block text-sm font-medium">{t('model.height')}</label>
                <input className="border rounded px-2 py-1" value={addModelData.height || ''} onChange={e => setAddModelData(d => ({ ...d, height: e.target.value }))} />
                <label className="block text-sm font-medium">{t('model.weight')}</label>
                <input className="border rounded px-2 py-1" value={addModelData.weight || ''} onChange={e => setAddModelData(d => ({ ...d, weight: e.target.value }))} />
                <label className="block text-sm font-medium">{t('model.body')}</label>
                <input className="border rounded px-2 py-1" value={addModelData.body || ''} onChange={e => setAddModelData(d => ({ ...d, body: e.target.value }))} />
                <label className="block text-sm font-medium">{t('model.gender')}</label>
                <select 
                  className="border rounded px-2 py-1" 
                  value={addModelData.gender || 'female'} 
                  onChange={e => setAddModelData(d => ({ ...d, gender: e.target.value }))}
                >
                  <option value="female">{t('model.female')}</option>
                  <option value="male">{t('model.male')}</option>
                </select>
                <button
                  className="mt-4 w-full py-2 bg-primary text-white rounded font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
                  onClick={handleAddModelConfirm}
                  disabled={!(addModelData.name && addModelData.style && addModelData.height && addModelData.weight && addModelData.body && addModelImage)}
                >
                  <Plus className="w-5 h-5" /> {t('model.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
