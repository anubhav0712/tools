import { registry } from '../core/registry';

// Utility Tools
import { textAnalyzerTool } from './text-analyzer/definition';
import { base64ConverterTool } from './base64-converter/definition';
import { jsonFormatterTool } from './json-formatter/definition';

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
