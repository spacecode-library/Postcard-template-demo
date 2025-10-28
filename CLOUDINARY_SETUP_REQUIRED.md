# ⚠️ REQUIRED: Cloudinary Upload Preset Setup

## Current Issue
Your campaign save functionality is failing with error:
```
Error: Upload preset not found
```

This is because the Cloudinary upload preset `postcard_uploads` doesn't exist yet.

## What You Need to Do

### Step 1: Login to Cloudinary
1. Go to [cloudinary.com](https://cloudinary.com)
2. Login with your account credentials

### Step 2: Create Upload Preset
1. Click **Settings** (gear icon in top right)
2. Navigate to **Upload** tab
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**

### Step 3: Configure the Preset
Set these values exactly:

| Setting | Value |
|---------|-------|
| **Preset name** | `postcard_uploads` |
| **Signing mode** | **Unsigned** (IMPORTANT!) |
| **Folder** | `postcards` |
| **Use filename** | ✅ Enabled |
| **Unique filename** | ✅ Enabled |

**Image Settings** (recommended for PNG optimization):
- **Format**: Auto (let Cloudinary auto-detect)
- **Quality**: Auto
- **Width**: Leave empty
- **Height**: Leave empty

**Advanced Settings** (optional but recommended):
- **Allowed formats**: Leave empty (allow all) OR set to: `scene,psd,png,jpg`
- **Resource type**: Auto-detect
- **Overwrite**: No (keep versions)
- **Incoming Transformation**: Leave empty (unsigned uploads don't support this)

### Step 4: Save
1. Click **Save** at the bottom
2. You should see `postcard_uploads` in your list of upload presets

## Verify Setup

Your Cloudinary credentials from `.env`:
```env
VITE_CLOUDINARY_CLOUD_NAME='dpavbfdzv'
VITE_CLOUDINARY_API_KEY='762385588378223'
```

The preset will work with cloud name: **dpavbfdzv**

## After Setup

1. **Restart your dev server**: Stop and restart `npm run dev`
2. **Try saving a design again**:
   - Go to Step 3 (Editor)
   - Click "Save Design" button
   - Should successfully upload to Cloudinary

## What This Enables

Once configured, your app will be able to:
- ✅ Save postcard designs (.scene files) to Cloudinary
- ✅ Save PNG preview images to Cloudinary
- ✅ Load saved designs for editing later
- ✅ Display previews on dashboard

## Folder Structure in Cloudinary

After setup, files will be organized like:
```
postcards/
  └── {userId}/
      └── campaigns/
          └── {campaignId}/
              ├── design/
              │   └── scene_{timestamp}.scene
              └── preview/
                  └── preview_{timestamp}.png
```

## Troubleshooting

**Still getting "Upload preset not found"?**
- Make sure preset name is EXACTLY: `postcard_uploads` (lowercase, underscore)
- Make sure Signing Mode is set to **Unsigned**
- Check that you saved the preset
- Restart your dev server

**Getting CORS errors?**
- In Cloudinary Settings → Security
- Add your domain to **Allowed fetch domains**
- Add: `http://localhost:5173` for development

---

**Need help?** Check [Cloudinary Upload Preset Docs](https://cloudinary.com/documentation/upload_presets)
