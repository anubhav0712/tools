import { registry } from '../core/registry';

// Utility & Developer Suite
import { textAnalyzerTool } from './text-analyzer/definition';
import { base64ConverterTool } from './base64-converter/definition';
import { jsonFormatterTool } from './json-formatter/definition';

// Security & Cryptography Suite (Tier 1)
import { jwtInspectorTool } from './jwt-inspector/definition';
import { diffCheckerTool } from './diff-checker/definition';
import { passphraseGeneratorTool } from './passphrase-generator/definition';
import { hashGeneratorTool } from './hash-generator/definition';

// Developer & Data Tools (Tier 2)
import { cronParserTool } from './cron-parser/definition';
import { csvJsonConverterTool } from './csv-json-converter/definition';
import { sqlFormatterTool } from './sql-formatter/definition';
import { regexTesterTool } from './regex-tester/definition';
import { urlInspectorTool } from './url-inspector/definition';

// Text & Productivity Tools (Tier 4)
import { caseConverterTool } from './case-converter/definition';
import { listDeduplicatorTool } from './list-deduplicator/definition';
import { markdownPreviewTool } from './markdown-preview/definition';

// Media, Visual & Document Tools (Tier 3)
import { colorContrastCheckerTool } from './color-contrast-checker/definition';
import { svgSanitizerTool } from './svg-sanitizer/definition';
import { qrCodeTool } from './qr-code-tool/definition';
import { exifScrubberTool } from './exif-scrubber/definition';
import { imageCompressorTool } from './image-compressor/definition';
import { pdfManipulatorTool } from './pdf-manipulator/definition';
import { kaveriPhotoResizerTool } from './kaveri-photo-resizer/definition';
import { photoRedactorTool } from './photo-redactor/definition';
import { passportPhotoGridTool } from './passport-photo-grid/definition';

// Finance Suite
import { loanCalculatorTool } from './loan-calculator/definition';
import { sipCalculatorTool } from './sip-calculator/definition';
import { compoundInterestCalculatorTool } from './compound-interest-calculator/definition';
import { salaryTaxCalculatorTool } from './salary-tax-calculator/definition';
import { retirementCalculatorTool } from './retirement-calculator/definition';
import { debtPayoffCalculatorTool } from './debt-payoff-calculator/definition';
import { inflationCalculatorTool } from './inflation-calculator/definition';
import { emergencyFundCalculatorTool } from './emergency-fund-calculator/definition';
import { fdCalculatorTool } from './fd-calculator/definition';
import { autoLoanCalculatorTool } from './auto-loan-calculator/definition';

// Register all available tools
registry.register(jwtInspectorTool);
registry.register(diffCheckerTool);
registry.register(passphraseGeneratorTool);
registry.register(hashGeneratorTool);

registry.register(cronParserTool);
registry.register(csvJsonConverterTool);
registry.register(sqlFormatterTool);
registry.register(regexTesterTool);
registry.register(urlInspectorTool);

registry.register(caseConverterTool);
registry.register(listDeduplicatorTool);
registry.register(markdownPreviewTool);

registry.register(colorContrastCheckerTool);
registry.register(svgSanitizerTool);
registry.register(qrCodeTool);
registry.register(exifScrubberTool);
registry.register(imageCompressorTool);
registry.register(pdfManipulatorTool);
registry.register(kaveriPhotoResizerTool);
registry.register(photoRedactorTool);
registry.register(passportPhotoGridTool);

registry.register(loanCalculatorTool);
registry.register(sipCalculatorTool);
registry.register(compoundInterestCalculatorTool);
registry.register(salaryTaxCalculatorTool);
registry.register(retirementCalculatorTool);
registry.register(debtPayoffCalculatorTool);
registry.register(inflationCalculatorTool);
registry.register(emergencyFundCalculatorTool);
registry.register(fdCalculatorTool);
registry.register(autoLoanCalculatorTool);

registry.register(textAnalyzerTool);
registry.register(base64ConverterTool);
registry.register(jsonFormatterTool);

export {
  jwtInspectorTool,
  diffCheckerTool,
  passphraseGeneratorTool,
  hashGeneratorTool,
  cronParserTool,
  csvJsonConverterTool,
  sqlFormatterTool,
  regexTesterTool,
  urlInspectorTool,
  caseConverterTool,
  listDeduplicatorTool,
  markdownPreviewTool,
  colorContrastCheckerTool,
  svgSanitizerTool,
  qrCodeTool,
  exifScrubberTool,
  imageCompressorTool,
  pdfManipulatorTool,
  kaveriPhotoResizerTool,
  photoRedactorTool,
  passportPhotoGridTool,
  loanCalculatorTool,
  sipCalculatorTool,
  compoundInterestCalculatorTool,
  salaryTaxCalculatorTool,
  retirementCalculatorTool,
  debtPayoffCalculatorTool,
  inflationCalculatorTool,
  emergencyFundCalculatorTool,
  fdCalculatorTool,
  autoLoanCalculatorTool,
  textAnalyzerTool,
  base64ConverterTool,
  jsonFormatterTool,
};
