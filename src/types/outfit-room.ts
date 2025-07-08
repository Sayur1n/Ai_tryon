export interface OutfitRoomData {
  id: string;
  userId: string;
  modelImageUrl?: string;
  topImageUrl?: string;
  bottomImageUrl?: string;
  modelImageLink?: string;
  topImageLink?: string;
  bottomImageLink?: string;
  description?: string;
  sex: 'male' | 'female';
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOutfitRoomRequest {
  modelImageUrl?: string;
  topImageUrl?: string;
  bottomImageUrl?: string;
  modelImageLink?: string;
  topImageLink?: string;
  bottomImageLink?: string;
  description?: string;
  sex: 'male' | 'female';
  type: string;
}

export interface OutfitRoomResponse {
  success: boolean;
  data?: OutfitRoomData;
  error?: string;
} 