// Executa no navegador (Frontend)
export async function comprimirImagemParaBase64(
  file: File,
  maxWidth = 1600, // 1600px é perfeito para leitura de textos/OCR
  quality = 0.7    // 70% de qualidade preserva a legibilidade e reduz muito o peso
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Falha ao criar contexto do Canvas"));
          return;
        }

        // Calcula as novas proporções mantendo o aspecto original
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenha a imagem redimensionada no canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Exporta como JPEG (o Gemini lida muito bem com JPEG e é mais leve que PNG)
        const base64Comprimido = canvas.toDataURL("image/jpeg", quality);
        
        resolve(base64Comprimido);
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
}