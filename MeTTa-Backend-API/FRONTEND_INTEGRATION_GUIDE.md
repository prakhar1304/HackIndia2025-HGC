# Frontend Integration Guide for Advanced Rule Templates

## Overview
This guide shows how to integrate the 3 new advanced MeTTa rule templates into your Next.js frontend.

## 🎯 New Rule Templates

### 1. FindDetail Template
- **Purpose**: Get all details for a specific user ID
- **Input**: Function name, output format
- **Example**: `!(findDetail 1)` → Returns all details for user ID 1

### 2. FindByCondition Template  
- **Purpose**: Find IDs where column value meets condition
- **Input**: Function name, column, operator, value
- **Example**: `!(findByCondition rating)` → Returns IDs with rating > 6

### 3. FindByConditionFull Template
- **Purpose**: Find IDs with condition AND return full details
- **Input**: Function name, column, operator, value, output format
- **Example**: `!(findByConditionFull rating)` → Returns full details for IDs with rating > 6

## 🔧 Frontend Implementation

### 1. Update Rule Template State

```jsx
// In your rule builder component
const [currentRule, setCurrentRule] = useState({
    rule_type: 'flexible', // Default
    function_name: '',
    variable_name: '',
    condition: {
        column: '',
        operator: '==',
        value: ''
    },
    true_action: '',
    false_action: '',
    // New fields for advanced templates
    output_format: '("user" $c "is" , $x)',
    column: '',
    operator: '>',
    value: ''
});
```

### 2. Update Template Dropdown

```jsx
// In your template selector
const templateOptions = [
    { value: 'flexible', label: 'Flexible Rule' },
    { value: 'match', label: 'MATCH Pattern with IF Condition' },
    { value: 'findDetail', label: 'Find Detail by ID' },
    { value: 'findByCondition', label: 'Find IDs by Condition' },
    { value: 'findByConditionFull', label: 'Find IDs by Condition (Full Details)' }
];

// Template change handler
const handleTemplateChange = (template) => {
    setCurrentRule({
        ...currentRule,
        rule_type: template,
        // Reset fields based on template
        function_name: getDefaultFunctionName(template),
        output_format: '("user" $c "is" , $x)',
        column: '',
        operator: '>',
        value: ''
    });
};

const getDefaultFunctionName = (template) => {
    switch (template) {
        case 'findDetail': return 'findDetail';
        case 'findByCondition': return 'findByCondition';
        case 'findByConditionFull': return 'findByConditionFull';
        default: return '';
    }
};
```

### 3. Create Advanced Rule Form Components

#### FindDetailRuleForm Component
```jsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FindDetailRuleForm = ({ currentRule, setCurrentRule }) => {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="function_name">Function Name</Label>
                <Input
                    id="function_name"
                    value={currentRule.function_name || 'findDetail'}
                    onChange={(e) => setCurrentRule({
                        ...currentRule,
                        function_name: e.target.value
                    })}
                    placeholder="e.g., findDetail"
                />
            </div>
            
            <div>
                <Label htmlFor="output_format">Output Format</Label>
                <Input
                    id="output_format"
                    value={currentRule.output_format || '($c $x)'}
                    onChange={(e) => setCurrentRule({
                        ...currentRule,
                        output_format: e.target.value
                    })}
                    placeholder='e.g., ($c $x)'
                />
                <p className="text-xs text-gray-600 mt-1">
                    $c = column name, $x = value
                </p>
            </div>
        </div>
    );
};

export default FindDetailRuleForm;
```

#### FindByConditionRuleForm Component
```jsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FindByConditionRuleForm = ({ currentRule, setCurrentRule, columns }) => {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="function_name">Function Name</Label>
                <Input
                    id="function_name"
                    value={currentRule.function_name || 'findByCondition'}
                    onChange={(e) => setCurrentRule({
                        ...currentRule,
                        function_name: e.target.value
                    })}
                    placeholder="e.g., findByCondition"
                />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="column">Column</Label>
                    <Select
                        value={currentRule.column}
                        onValueChange={(value) => setCurrentRule({
                            ...currentRule,
                            column: value
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                            {columns.map((column, index) => (
                                <SelectItem key={index} value={column.name}>
                                    {column.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <Label htmlFor="operator">Operator</Label>
                    <Select
                        value={currentRule.operator}
                        onValueChange={(value) => setCurrentRule({
                            ...currentRule,
                            operator: value
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=">">&gt; (greater than)</SelectItem>
                            <SelectItem value="<">&lt; (less than)</SelectItem>
                            <SelectItem value=">=">&gt;= (greater or equal)</SelectItem>
                            <SelectItem value="<=">&lt;= (less or equal)</SelectItem>
                            <SelectItem value="==">== (equals)</SelectItem>
                            <SelectItem value="!=">!= (not equals)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                        id="value"
                        value={currentRule.value}
                        onChange={(e) => setCurrentRule({
                            ...currentRule,
                            value: e.target.value
                        })}
                        placeholder="e.g., 6"
                    />
                </div>
            </div>
        </div>
    );
};

export default FindByConditionRuleForm;
```

#### FindByConditionFullRuleForm Component
```jsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FindByConditionFullRuleForm = ({ currentRule, setCurrentRule, columns }) => {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="function_name">Function Name</Label>
                <Input
                    id="function_name"
                    value={currentRule.function_name || 'findByConditionFull'}
                    onChange={(e) => setCurrentRule({
                        ...currentRule,
                        function_name: e.target.value
                    })}
                    placeholder="e.g., findByConditionFull"
                />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="column">Column</Label>
                    <Select
                        value={currentRule.column}
                        onValueChange={(value) => setCurrentRule({
                            ...currentRule,
                            column: value
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                            {columns.map((column, index) => (
                                <SelectItem key={index} value={column.name}>
                                    {column.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <Label htmlFor="operator">Operator</Label>
                    <Select
                        value={currentRule.operator}
                        onValueChange={(value) => setCurrentRule({
                            ...currentRule,
                            operator: value
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=">">&gt; (greater than)</SelectItem>
                            <SelectItem value="<">&lt; (less than)</SelectItem>
                            <SelectItem value=">=">&gt;= (greater or equal)</SelectItem>
                            <SelectItem value="<=">&lt;= (less or equal)</SelectItem>
                            <SelectItem value="==">== (equals)</SelectItem>
                            <SelectItem value="!=">!= (not equals)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                        id="value"
                        value={currentRule.value}
                        onChange={(e) => setCurrentRule({
                            ...currentRule,
                            value: e.target.value
                        })}
                        placeholder="e.g., 6"
                    />
                </div>
            </div>
            
            <div>
                <Label htmlFor="output_format">Output Format</Label>
                <Input
                    id="output_format"
                    value={currentRule.output_format || '("user" $c "is" , $value)'}
                    onChange={(e) => setCurrentRule({
                        ...currentRule,
                        output_format: e.target.value
                    })}
                    placeholder='e.g., ("user" $c "is" , $value)'
                />
                <p className="text-xs text-gray-600 mt-1">
                    $c = column name, $value = value
                </p>
            </div>
        </div>
    );
};

export default FindByConditionFullRuleForm;
```

### 4. Update Rule Form Renderer

```jsx
// In your main rule builder component
import FindDetailRuleForm from './FindDetailRuleForm';
import FindByConditionRuleForm from './FindByConditionRuleForm';
import FindByConditionFullRuleForm from './FindByConditionFullRuleForm';

const renderRuleForm = () => {
    switch (currentRule.rule_type) {
        case 'findDetail':
            return (
                <FindDetailRuleForm 
                    currentRule={currentRule} 
                    setCurrentRule={setCurrentRule} 
                />
            );
        case 'findByCondition':
            return (
                <FindByConditionRuleForm 
                    currentRule={currentRule} 
                    setCurrentRule={setCurrentRule} 
                    columns={columns} 
                />
            );
        case 'findByConditionFull':
            return (
                <FindByConditionFullRuleForm 
                    currentRule={currentRule} 
                    setCurrentRule={setCurrentRule} 
                    columns={columns} 
                />
            );
        case 'match':
            return <MatchRuleForm />;
        default:
            return <FlexibleRuleForm />;
    }
};
```

### 5. Update Rule Validation

```jsx
const validateRule = (rule) => {
    switch (rule.rule_type) {
        case 'findDetail':
            return rule.function_name && rule.output_format;
        case 'findByCondition':
            return rule.function_name && rule.column && rule.operator && rule.value;
        case 'findByConditionFull':
            return rule.function_name && rule.column && rule.operator && rule.value && rule.output_format;
        case 'match':
            return rule.function_name && rule.condition.column;
        default:
            return rule.condition.column;
    }
};
```

### 6. Update Rule Collection

```jsx
const collectRuleData = (rule) => {
    const baseRule = {
        id: generateId(),
        rule_type: rule.rule_type,
        function_name: rule.function_name,
        preview: generateRulePreview(rule)
    };
    
    switch (rule.rule_type) {
        case 'findDetail':
            return {
                ...baseRule,
                output_format: rule.output_format
            };
        case 'findByCondition':
            return {
                ...baseRule,
                column: rule.column,
                operator: rule.operator,
                value: rule.value
            };
        case 'findByConditionFull':
            return {
                ...baseRule,
                column: rule.column,
                operator: rule.operator,
                value: rule.value,
                output_format: rule.output_format
            };
        case 'match':
            return {
                ...baseRule,
                variable_name: rule.variable_name,
                condition: rule.condition,
                true_action: rule.true_action,
                false_action: rule.false_action
            };
        default:
            return {
                ...baseRule,
                parameter: rule.parameter,
                condition: rule.condition,
                true_action: rule.true_action,
                false_action: rule.false_action
            };
    }
};
```

## 🎨 UI/UX Enhancements

### 1. Template Preview Cards
```jsx
const TemplatePreviewCard = ({ template, isSelected, onClick }) => {
    const getTemplateDescription = (type) => {
        switch (type) {
            case 'findDetail': return 'Get all details for a specific user ID';
            case 'findByCondition': return 'Find IDs where column value meets condition';
            case 'findByConditionFull': return 'Find IDs with condition and return full details';
            default: return 'Custom rule with flexible conditions';
        }
    };
    
    return (
        <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={onClick}
        >
            <h3 className="font-bold text-lg">{template.label}</h3>
            <p className="text-sm text-gray-600">{getTemplateDescription(template.value)}</p>
        </div>
    );
};
```

### 2. Rule Preview Component
```jsx
const RulePreview = ({ rule }) => {
    const generatePreview = (rule) => {
        switch (rule.rule_type) {
            case 'findDetail':
                return `(= (${rule.function_name} $id)\n     (match &self ($c $id $x)  ${rule.output_format})\n)`;
            case 'findByCondition':
                return `(= (${rule.function_name} $x)\n     (match &self (${rule.column} $y $z) (if (${rule.operator} $y  ${rule.value}) $y  ()))\n)`;
            case 'findByConditionFull':
                return `(= (${rule.function_name} $x)\n     (match &self (${rule.column} $y $z) (if (${rule.operator} $y  ${rule.value}) (match &self ($c $y $value)  ${rule.output_format}  )  ()))\n)`;
            default:
                return 'Custom rule preview';
        }
    };
    
    return (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">{generatePreview(rule)}</pre>
        </div>
    );
};
```

## 🧪 Testing Examples

### Test Query Examples
```jsx
const testQueries = [
    {
        name: 'Find Detail for ID 1',
        query: '!(findDetail 1)',
        description: 'Get all details for user ID 1'
    },
    {
        name: 'Find IDs with Rating > 6',
        query: '!(findByCondition rating)',
        description: 'Find all user IDs where rating is greater than 6'
    },
    {
        name: 'Find Full Details for High Ratings',
        query: '!(findByConditionFull rating)',
        description: 'Get full details for all users with rating > 6'
    }
];
```

## 🚀 Implementation Checklist

- [ ] Update rule state structure
- [ ] Add new template options to dropdown
- [ ] Create 3 new rule form components
- [ ] Update rule form renderer
- [ ] Update rule validation logic
- [ ] Update rule collection logic
- [ ] Add template preview cards
- [ ] Add rule preview component
- [ ] Test all 3 templates
- [ ] Update documentation

## 🎯 Benefits

- **More Powerful**: Users can create complex queries easily
- **User-Friendly**: Simple UI for complex MeTTa operations
- **Flexible**: Customizable output formats
- **Real MeTTa**: Uses actual MeTTa interpreter
- **Extensible**: Easy to add more templates

This implementation gives users powerful tools to create sophisticated MeTTa queries through a simple, intuitive interface! 🎉
