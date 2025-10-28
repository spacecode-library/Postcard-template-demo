# PSD Save/Reload Implementation Guide

This guide explains how to implement PSD save and reload functionality in your campaign flow.

## Overview

The PSD save/reload system allows users to:
1. **Save their work** automatically when creating or editing a campaign
2. **Resume editing** from where they left off when they return to edit a campaign
3. **Preserve all customizations** including text, images, colors, and layout

## Components

### 1. PSD Storage Service
**Location:** `/src/supabase/api/psdStorageService.js`

**Key Methods:**
- `savePSD(psdFile, campaignId, fileName)` - Save PSD/scene file to storage
- `exportSceneAsPSD(cesdk)` - Export current editor scene as a file
- `loadSceneFromStorage(cesdk, sceneUrl)` - Load saved scene back into editor
- `loadPSD(psdUrl)` - Fetch PSD file from storage

### 2. Campaign Service Enhancement
**Location:** `/src/supabase/api/campaignService.js`

**New Method:**
- `saveCampaignDesign(campaignId, designUrl, previewUrl)` - Save design URLs to campaign record

## Implementation Steps

### Step 1: Import Required Services

```javascript
import psdStorageService from '../../supabase/api/psdStorageService';
import campaignService from '../../supabase/api/campaignService';
```

### Step 2: Save Scene During Campaign Creation

Add this to your PostcardEditor or Onboarding component:

```javascript
const handleSaveDesign = async (campaignId) => {
  try {
    // Get the editor instance (cesdk)
    const editorInstance = currentEditorInstance.current;

    if (!editorInstance || !editorInstance.engine) {
      throw new Error('Editor not initialized');
    }

    // Export scene as file
    const sceneBlob = await psdStorageService.exportSceneAsPSD(editorInstance);

    // Upload to storage
    const uploadResult = await psdStorageService.savePSD(
      sceneBlob,
      campaignId,
      `campaign-${campaignId}-design.scene`
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    // Save URL to campaign record
    await campaignService.saveCampaignDesign(
      campaignId,
      uploadResult.publicUrl
    );

    console.log('✅ Design saved successfully');
  } catch (error) {
    console.error('❌ Error saving design:', error);
    throw error;
  }
};
```

### Step 3: Load Scene When Editing Campaign

Add this to your campaign edit flow:

```javascript
const handleLoadSavedDesign = async (campaign) => {
  try {
    // Check if campaign has a saved design
    if (!campaign.postcard_design_url) {
      console.log('No saved design found, starting fresh');
      return false;
    }

    // Get the editor instance
    const editorInstance = currentEditorInstance.current;

    if (!editorInstance || !editorInstance.engine) {
      throw new Error('Editor not initialized');
    }

    // Load scene from storage
    const loadResult = await psdStorageService.loadSceneFromStorage(
      editorInstance,
      campaign.postcard_design_url
    );

    if (!loadResult.success) {
      throw new Error(loadResult.error);
    }

    console.log('✅ Saved design loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error loading saved design:', error);
    // Fall back to loading from template
    return false;
  }
};
```

### Step 4: Auto-Save on Continue/Next

Hook into your "Continue" button in the onboarding flow:

```javascript
const handleContinue = async () => {
  try {
    // Get campaign ID from localStorage or state
    const campaignId = localStorage.getItem('currentCampaignId');

    if (campaignId) {
      // Auto-save design before continuing
      await handleSaveDesign(campaignId);
    }

    // Navigate to next step
    navigate('/onboarding/step4');
  } catch (error) {
    toast.error('Failed to save your design');
    console.error(error);
  }
};
```

### Step 5: Integrate with Campaign Edit Page

In your campaign edit page or dashboard:

```javascript
const handleEditCampaign = async (campaignId) => {
  try {
    // Fetch campaign data
    const { campaign } = await campaignService.getCampaignById(campaignId);

    // Navigate to editor with campaign data
    navigate('/editor', {
      state: {
        campaign,
        mode: 'edit'
      }
    });
  } catch (error) {
    toast.error('Failed to load campaign');
  }
};
```

Then in your editor component:

```javascript
useEffect(() => {
  const initializeEditor = async () => {
    // Get campaign from navigation state
    const { campaign, mode } = location.state || {};

    if (mode === 'edit' && campaign) {
      // Load saved design
      const loaded = await handleLoadSavedDesign(campaign);

      if (!loaded && campaign.template_id) {
        // Fall back to loading original template
        await loadTemplateInEditor(campaign.template_id);
      }
    }
  };

  initializeEditor();
}, []);
```

## Usage Example

### Creating a New Campaign

```javascript
// OnboardingStep3.jsx or CreateCampaign.jsx

const OnboardingStep3 = () => {
  const [campaignId, setCampaignId] = useState(null);

  // Step 1: Create campaign record
  useEffect(() => {
    const createCampaign = async () => {
      const result = await campaignService.createCampaign({
        name: 'My Campaign',
        status: 'draft'
      });

      setCampaignId(result.campaign.id);
      localStorage.setItem('currentCampaignId', result.campaign.id);
    };

    createCampaign();
  }, []);

  // Step 2: Auto-save when user clicks Continue
  const handleContinue = async () => {
    if (campaignId) {
      await handleSaveDesign(campaignId);
    }
    navigate('/onboarding/step4');
  };

  return (
    // ... editor UI
    <button onClick={handleContinue}>Continue</button>
  );
};
```

### Editing an Existing Campaign

```javascript
// Dashboard.jsx

const Dashboard = () => {
  const handleEditCampaign = (campaignId) => {
    navigate(`/campaign/${campaignId}/edit`);
  };

  return (
    <CampaignCard
      onEdit={handleEditCampaign}
    />
  );
};
```

```javascript
// CampaignEditPage.jsx

const CampaignEditPage = () => {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    const loadCampaign = async () => {
      const result = await campaignService.getCampaignById(campaignId);
      setCampaign(result.campaign);

      // Load saved design if exists
      if (result.campaign.postcard_design_url) {
        await handleLoadSavedDesign(result.campaign);
      }
    };

    loadCampaign();
  }, [campaignId]);

  return (
    <PostcardEditor
      campaign={campaign}
      mode="edit"
    />
  );
};
```

## Storage Configuration

### Supabase Storage Bucket

Ensure you have a storage bucket named `campaign-assets` in your Supabase project:

1. Go to Supabase Dashboard → Storage
2. Create bucket: `campaign-assets`
3. Set permissions:
   ```sql
   -- Allow authenticated users to upload to their own folders
   CREATE POLICY "Users can upload to own folder"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'campaign-assets'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );

   -- Allow users to read their own files
   CREATE POLICY "Users can read own files"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'campaign-assets'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

## Database Schema

Ensure your `campaigns` table has these fields:

```sql
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS postcard_design_url TEXT,
ADD COLUMN IF NOT EXISTS postcard_preview_url TEXT;
```

## Error Handling

Always wrap save/load operations in try-catch blocks:

```javascript
try {
  await handleSaveDesign(campaignId);
  toast.success('Design saved!');
} catch (error) {
  toast.error('Failed to save design');
  console.error('Save error:', error);
  // Don't block user from continuing
}
```

## Performance Tips

1. **Debounce auto-saves** - Don't save on every keystroke
2. **Use loading states** - Show spinner during save/load
3. **Cache in memory** - Keep current scene in state to avoid re-fetching
4. **Compress large files** - Consider compressing scene data before upload

## Testing Checklist

- [ ] Scene saves successfully during campaign creation
- [ ] Saved scene loads correctly when editing
- [ ] User customizations (text, images, colors) are preserved
- [ ] Double-sided postcards load both sides correctly
- [ ] Error handling works (network failures, permission issues)
- [ ] Loading states show during save/load operations
- [ ] Storage bucket permissions are correct
- [ ] Database fields are populated correctly

## Next Steps

1. ✅ PSD Storage Service created
2. ✅ Campaign Service enhanced with design save method
3. ✅ Z-index hierarchy documented
4. ✅ PSD editor buttons redesigned
5. ⏳ Integrate save/reload into PostcardEditor component
6. ⏳ Add auto-save on Continue button
7. ⏳ Add load saved design on campaign edit
8. ⏳ Add framer-motion animations

---

**Last Updated:** January 2025
