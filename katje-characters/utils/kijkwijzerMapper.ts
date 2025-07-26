
import { KijkwijzerAgeRating, KijkwijzerPictogram, KijkwijzerResult } from "../types";

type Likelihood = 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';

interface SafeSearchAnnotation {
    adult: Likelihood;
    spoof: Likelihood;
    medical: Likelihood;
    violence: Likelihood;
    racy: Likelihood;
}

const isSignificant = (likelihood: Likelihood): boolean => {
    return likelihood === 'LIKELY' || likelihood === 'VERY_LIKELY';
}

export const mapVisionToKijkwijzer = (annotation: SafeSearchAnnotation | undefined): KijkwijzerResult => {
    if (!annotation) {
        return { age: KijkwijzerAgeRating.AL, pictograms: [] };
    }

    let ageRating = KijkwijzerAgeRating.AL;
    const pictograms = new Set<KijkwijzerPictogram>();

    if (isSignificant(annotation.violence)) {
        ageRating = KijkwijzerAgeRating._16;
        pictograms.add(KijkwijzerPictogram.VIOLENCE);
    }
    
    if (isSignificant(annotation.adult)) {
        // Adult content is a strong indicator for a high rating
        ageRating = KijkwijzerAgeRating._16;
        pictograms.add(KijkwijzerPictogram.SEX);
    } else if (isSignificant(annotation.racy)) {
        // Racy content could be less severe
        if (ageRating !== KijkwijzerAgeRating._16) {
           ageRating = KijkwijzerAgeRating._12;
        }
        pictograms.add(KijkwijzerPictogram.SEX);
    }


    // The user did not specify a mapping for Fear, so it's omitted.
    // If we wanted to add it, we might infer it from 'violence' or have a dedicated AI check.
    // For now, we stick to the clear mappings.

    return {
        age: ageRating,
        pictograms: Array.from(pictograms),
    };
};
