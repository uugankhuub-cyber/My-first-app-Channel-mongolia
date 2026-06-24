
export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return response.status(200).json({ 
      success: true, 
      message: 'Upload successful (Mock Mode)',
      url: null 
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return response.status(500).json({ error: 'Upload failed' });
  }
}
