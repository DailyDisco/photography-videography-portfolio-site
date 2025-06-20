import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isLoading: boolean;
  isSidebarOpen: boolean;
  isUploadModalOpen: boolean;
  isImageLightboxOpen: boolean;
  selectedImageUrl: string | null;
  uploadProgress: Record<string, number>;
}

const initialState: UiState = {
  isLoading: false,
  isSidebarOpen: false,
  isUploadModalOpen: false,
  isImageLightboxOpen: false,
  selectedImageUrl: null,
  uploadProgress: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setUploadModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isUploadModalOpen = action.payload;
    },
    setImageLightboxOpen: (state, action: PayloadAction<boolean>) => {
      state.isImageLightboxOpen = action.payload;
    },
    setSelectedImageUrl: (state, action: PayloadAction<string | null>) => {
      state.selectedImageUrl = action.payload;
    },
    openImageLightbox: (state, action: PayloadAction<string>) => {
      state.selectedImageUrl = action.payload;
      state.isImageLightboxOpen = true;
    },
    closeImageLightbox: (state) => {
      state.isImageLightboxOpen = false;
      state.selectedImageUrl = null;
    },
    setUploadProgress: (
      state,
      action: PayloadAction<{ fileId: string; progress: number }>
    ) => {
      const { fileId, progress } = action.payload;
      state.uploadProgress[fileId] = progress;
    },
    removeUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },
    clearUploadProgress: (state) => {
      state.uploadProgress = {};
    },
  },
});

export const {
  setLoading,
  toggleSidebar,
  setSidebarOpen,
  setUploadModalOpen,
  setImageLightboxOpen,
  setSelectedImageUrl,
  openImageLightbox,
  closeImageLightbox,
  setUploadProgress,
  removeUploadProgress,
  clearUploadProgress,
} = uiSlice.actions;

export default uiSlice.reducer;
