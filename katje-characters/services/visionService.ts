
import { VisionFeatureType, KijkwijzerPictogram } from '../types';
import { mapVisionToKijkwijzer } from '../utils/kijkwijzerMapper';

type VisionApiResponse = any;
type Likelihood = 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';

const isSignificant = (likelihood: Likelihood): boolean => {
    return likelihood === 'LIKELY' || likelihood === 'VERY_LIKELY';
}

const LIKELIHOOD_MAP: { [key: string]: string } = {
  VERY_UNLIKELY: '🟢 Very Unlikely',
  UNLIKELY: '🟢 Unlikely',
  POSSIBLE: '🟡 Possible',
  LIKELY: '🟠 Likely',
  VERY_LIKELY: '🔴 Very Likely',
  UNKNOWN: '⚪ Unknown',
};

function formatKijkwijzerReportSection(annotation: any): string {
  if (!annotation) return '';

  const rating = mapVisionToKijkwijzer(annotation);
  
  let md = '## 🇳🇱 Kijkwijzer Rating & Justification\n\n';
  md += `The content has been assigned a rating of **${rating.age === 'AL' ? 'All Ages (AL)' : `${rating.age} and up`}**.\n\n`;

  if (rating.age === 'AL' && rating.pictograms.length === 0) {
      md += 'No sensitive content requiring a higher age rating was detected.\n\n---\n\n';
      return md;
  }
  
  md += '**Justification:**\n\n'

  const reasons = new Set<string>();
  if (rating.pictograms.includes(KijkwijzerPictogram.VIOLENCE)) {
    reasons.add(`*   **Violence:** The system detected a **${annotation.violence.toLowerCase().replace(/_/g, ' ')}** likelihood of violent content.`);
  }
  if (rating.pictograms.includes(KijkwijzerPictogram.SEX)) {
      if (isSignificant(annotation.adult)) {
           reasons.add(`*   **Sexual Content:** The system detected a **${annotation.adult.toLowerCase().replace(/_/g, ' ')}** likelihood of adult content.`);
      } else if (isSignificant(annotation.racy)) {
           reasons.add(`*   **Sexual Content:** The system detected a **${annotation.racy.toLowerCase().replace(/_/g, ' ')}** likelihood of racy content.`);
      }
  }

  if (reasons.size > 0) {
    reasons.forEach(reason => {
        md += `${reason}\n`;
    });
  } else {
    md += 'The rating is based on a general assessment of content sensitivity.\n';
  }
  
  md += '\n---\n\n';

  return md;
}


function formatSafeSearch(annotation: any): string {
  if (!annotation) return '';
  let md = '## 🛡️ Safe Search Detection\n\n';
  md += `* **Adult Content:** ${LIKELIHOOD_MAP[annotation.adult]}\n`;
  md += `* **Spoof Content:** ${LIKELIHOOD_MAP[annotation.spoof]}\n`;
  md += `* **Medical Content:** ${LIKELIHOOD_MAP[annotation.medical]}\n`;
  md += `* **Violent Content:** ${LIKELIHOOD_MAP[annotation.violence]}\n`;
  md += `* **Racy Content:** ${LIKELIHOOD_MAP[annotation.racy]}\n\n`;
  return md;
}

function formatLabels(annotations: any[]): string {
  if (!annotations || annotations.length === 0) return '';
  let md = '## 🏷️ Labels\n\n';
  annotations.forEach(label => {
    md += `* **${label.description}** (Confidence: ${(label.score * 100).toFixed(1)}%)\n`;
  });
  return md + '\n';
}

function formatText(annotation: any): string {
  if (!annotation?.text) return '';
  let md = '## 📄 Text Detection (OCR)\n\n';
  md += '```\n' + annotation.text.trim() + '\n```\n\n';
  return md;
}

function formatDocumentText(annotation: any): string {
    if (!annotation?.text) return '';
    let md = '## 📑 Document Text Detection\n\n';
    md += '```\n' + annotation.text.trim() + '\n```\n\n';
    return md;
}

function formatFaces(annotations: any[]): string {
  if (!annotations || annotations.length === 0) return '';
  let md = `## 😀 Faces (${annotations.length} found)\n\n`;
  annotations.forEach((face, index) => {
    md += `### Face ${index + 1}\n`;
    md += `* **Detection Confidence:** ${(face.detectionConfidence * 100).toFixed(1)}%\n`;
    md += `* **Joy:** ${LIKELIHOOD_MAP[face.joyLikelihood]}\n`;
    md += `* **Sorrow:** ${LIKELIHOOD_MAP[face.sorrowLikelihood]}\n`;
    md += `* **Anger:** ${LIKELIHOOD_MAP[face.angerLikelihood]}\n`;
    md += `* **Surprise:** ${LIKELIHOOD_MAP[face.surpriseLikelihood]}\n`;
    md += `* **Under Exposed:** ${LIKELIHOOD_MAP[face.underExposedLikelihood]}\n`;
    md += `* **Blurred:** ${LIKELIHOOD_MAP[face.blurredLikelihood]}\n`;
    md += `* **Wearing Headwear:** ${LIKELIHOOD_MAP[face.headwearLikelihood]}\n\n`;

    if (face.landmarks && face.landmarks.length > 0) {
        md += '#### Facial Landmarks\n';
        face.landmarks.forEach((landmark: any) => {
            const type = landmark.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l:string) => l.toUpperCase());
            const pos = landmark.position;
            md += `* **${type}:** (x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)})\n`;
        });
        md += '\n';
    }
  });
  return md;
}

function formatObjects(annotations: any[]): string {
  if (!annotations || annotations.length === 0) return '';
  let md = `## 📦 Objects (${annotations.length} found)\n\n`;
  annotations.forEach(obj => {
    md += `### ${obj.name}\n`;
    md += `* **Confidence:** ${(obj.score * 100).toFixed(1)}%\n`;
    if (obj.boundingPoly?.normalizedVertices) {
        md += '* **Bounding Box (Normalized Coordinates):**\n';
        const vertices = obj.boundingPoly.normalizedVertices.map((v: any) => `(x: ${v.x?.toFixed(4)}, y: ${v.y?.toFixed(4)})`).join(', ');
        md += `  * ${vertices}\n`;
    }
    md += '\n';
  });
  return md;
}

function formatLandmarks(annotations: any[]): string {
    if (!annotations || annotations.length === 0) return '';
    let md = '## 🏛️ Landmarks\n\n';
    annotations.forEach(landmark => {
        md += `* **${landmark.description}** (Confidence: ${(landmark.score * 100).toFixed(1)}%)\n`;
        if (landmark.locations && landmark.locations[0]?.latLng) {
            const { latitude, longitude } = landmark.locations[0].latLng;
            md += `  * Location: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]\n`;
        }
    });
    return md + '\n';
}

function formatLogos(annotations: any[]): string {
    if (!annotations || annotations.length === 0) return '';
    let md = '## ®️ Logos\n\n';
    annotations.forEach(logo => {
        md += `* **${logo.description}** (Confidence: ${(logo.score * 100).toFixed(1)}%)\n`;
    });
    return md + '\n';
}

function formatProperties(annotation: any): string {
    if (!annotation?.dominantColors?.colors) return '';
    let md = '## 🎨 Image Properties\n\n';
    md += '### Dominant Colors\n';
    annotation.dominantColors.colors.forEach((c: any) => {
        if (!c.color) return;
        const r = (c.color.red || 0).toString(16).padStart(2, '0');
        const g = (c.color.green || 0).toString(16).padStart(2, '0');
        const b = (c.color.blue || 0).toString(16).padStart(2, '0');
        const hex = `#${r}${g}${b}`;
        md += `* <span style="display:inline-block;width:12px;height:12px;background-color:${hex};border:1px solid #888;"></span> **${hex}** (Score: ${(c.score * 100).toFixed(1)}%, Pixel Fraction: ${(c.pixelFraction * 100).toFixed(1)}%)\n`;
    });
    return md + '\n';
}

function formatCropHints(annotation: any): string {
  if (!annotation?.cropHints) return '';
  let md = '## ✂️ Crop Hints\n\n';
  annotation.cropHints.forEach((hint: any, index: number) => {
      md += `### Hint ${index + 1}\n`;
      md += `* **Confidence:** ${(hint.confidence * 100).toFixed(1)}%\n`;
       if (hint.importanceFraction) {
          md += `* **Importance Fraction:** ${hint.importanceFraction.toFixed(2)}\n`;
      }
      if (hint.boundingPoly?.vertices) {
          md += '* **Crop Coordinates (Pixels):**\n';
           const vertices = hint.boundingPoly.vertices.map((v: any) => `(x: ${v.x || 0}, y: ${v.y || 0})`).join(', ');
           md += `  * ${vertices}\n`;
      }
      md += '\n';
  });
  return md;
}

function formatWeb(annotation: any): string {
  if (!annotation) return '';
  let md = '## 🌐 Web Detection\n\n';
  
  if (annotation.bestGuessLabels?.length > 0) {
    md += '### Best Guess Labels\n';
    annotation.bestGuessLabels.forEach((label: any) => {
      md += `* ${label.label}\n`;
    });
    md += '\n';
  }

  if (annotation.webEntities?.length > 0) {
    md += '### Web Entities\n';
    annotation.webEntities.forEach((entity: any) => {
      md += `* **${entity.description || 'N/A'}** (Score: ${(entity.score * 100).toFixed(1)}%)\n`;
    });
    md += '\n';
  }
  
  return md;
}

export function parseVisionResponse(response: VisionApiResponse, imageBase64: string | null): string {
  if (response.error) {
      return `## ❌ API Error\n\n**Message:** ${response.error.message}\n\n\`\`\`json\n${JSON.stringify(response.error.details, null, 2)}\n\`\`\``;
  }
    
  let markdownReport = '# 👁️ Vision AI Analysis Report\n\n';

  if (imageBase64) {
    markdownReport += `![Analyzed Image](${imageBase64})\n\n---\n\n`;
  }

  markdownReport += formatKijkwijzerReportSection(response.safeSearchAnnotation);
  markdownReport += formatSafeSearch(response.safeSearchAnnotation);
  markdownReport += formatLabels(response.labelAnnotations);
  markdownReport += formatObjects(response.localizedObjectAnnotations);
  markdownReport += formatFaces(response.faceAnnotations);
  markdownReport += formatLandmarks(response.landmarkAnnotations);
  markdownReport += formatLogos(response.logoAnnotations);
  markdownReport += formatText(response.textAnnotations ? response.textAnnotations[0] : null);
  markdownReport += formatDocumentText(response.fullTextAnnotation);
  markdownReport += formatProperties(response.imagePropertiesAnnotation);
  markdownReport += formatCropHints(response.cropHintsAnnotation);
  markdownReport += formatWeb(response.webDetection);

  if (markdownReport.split('\n').filter(line => line.trim() !== '' && line !== '---').length <= 3) {
    return '## No Results\n\nThe Vision API did not return any data for the selected features. This could be because nothing was detected in the image.';
  }

  return markdownReport;
}