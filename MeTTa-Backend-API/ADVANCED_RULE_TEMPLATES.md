# Advanced MeTTa Rule Templates Integration Guide

## Overview
This guide explains how to integrate 3 new advanced MeTTa rule templates based on the working patterns from `kk.metta`:

1. **findDetail** - Get all details for a specific ID
2. **findByCondition** - Find IDs based on column condition  
3. **findByConditionFull** - Find IDs with condition and return full details

## 🎯 Rule Templates Analysis

### Template 1: findDetail
```metta
(= (findDetail $id)
     (match &self ($c $id $x)  ("user" $c "is" , $x))
)
```
**Purpose**: Get all details for a specific user ID
**Input**: User ID (e.g., 1, 2, 7)
**Output**: All user details in formatted string

### Template 2: findByCondition  
```metta
(= (findByCondition $x)
     (match &self ($x $y $z) (if (> $y  6) $y  ()))
)
```
**Purpose**: Find IDs where column value meets condition
**Input**: Column name, condition operator, condition value
**Output**: List of IDs that match condition

### Template 3: findByConditionFull
```metta
(= (findByConditionFull $x)
     (match &self ($x $y $z) (if (> $y  6) (match &self ($c $y $value)  ("user" $c "is" , $value)  )  ()))
)
```
**Purpose**: Find IDs with condition AND return full details
**Input**: Column name, condition operator, condition value
**Output**: Full details for all matching IDs

## 🔧 Backend API Changes

### 1. Update Rule Service (`services/rule_service.py`)

Add new rule type handling:

```python
def _generate_advanced_rule(self, rule: Dict[str, Any]) -> str:
    """Generate advanced MeTTa rule (findDetail, findByCondition, findByConditionFull)."""
    rule_type = rule.get('rule_type', 'findDetail')
    function_name = self._sanitize_function_name(rule.get('function_name', 'findDetail'))
    
    if rule_type == 'findDetail':
        return self._generate_find_detail_rule(rule)
    elif rule_type == 'findByCondition':
        return self._generate_find_by_condition_rule(rule)
    elif rule_type == 'findByConditionFull':
        return self._generate_find_by_condition_full_rule(rule)
    else:
        return f";; Unknown advanced rule type: {rule_type}"

def _generate_find_detail_rule(self, rule: Dict[str, Any]) -> str:
    """Generate findDetail rule."""
    function_name = self._sanitize_function_name(rule.get('function_name', 'findDetail'))
    output_format = rule.get('output_format', '("user" $c "is" , $x)')
    
    return f"""(= ({function_name} $id)
     (match &self ($c $id $x)  {output_format})
)"""

def _generate_find_by_condition_rule(self, rule: Dict[str, Any]) -> str:
    """Generate findByCondition rule."""
    function_name = self._sanitize_function_name(rule.get('function_name', 'findByCondition'))
    column = self._sanitize_column_name(rule.get('column', 'Field'))
    operator = rule.get('operator', '>')
    value = self._format_value(rule.get('value', '0'))
    
    return f"""(= ({function_name} $x)
     (match &self ({column} $y $z) (if ({operator} $y  {value}) $y  ()))
)"""

def _generate_find_by_condition_full_rule(self, rule: Dict[str, Any]) -> str:
    """Generate findByConditionFull rule."""
    function_name = self._sanitize_function_name(rule.get('function_name', 'findByConditionFull'))
    column = self._sanitize_column_name(rule.get('column', 'Field'))
    operator = rule.get('operator', '>')
    value = self._format_value(rule.get('value', '0'))
    output_format = rule.get('output_format', '("user" $c "is" , $value)')
    
    return f"""(= ({function_name} $x)
     (match &self ({column} $y $z) (if ({operator} $y  {value}) (match &self ($c $y $value)  {output_format}  )  ()))
)"""
```

### 2. Update MeTTa Service (`services/metta_service.py`)

Add advanced rule generation:

```python
def _generate_rule_content(self, rule: Dict[str, Any]) -> str:
    """Generate MeTTa rule content from rule data."""
    try:
        rule_type = rule.get('rule_type', 'flexible')
        
        if rule_type == 'match':
            return self._generate_match_rule(rule)
        elif rule_type in ['findDetail', 'findByCondition', 'findByConditionFull']:
            return self._generate_advanced_rule(rule)
        else:
            return self._generate_flexible_rule(rule)
            
    except Exception as e:
        return f";; Error generating rule: {str(e)}"

def _generate_advanced_rule(self, rule: Dict[str, Any]) -> str:
    """Generate advanced MeTTa rule."""
    rule_type = rule.get('rule_type', 'findDetail')
    function_name = self._sanitize_function_name(rule.get('function_name', 'findDetail'))
    
    if rule_type == 'findDetail':
        output_format = rule.get('output_format', '("user" $c "is" , $x)')
        return f"""(= ({function_name} $id)
     (match &self ($c $id $x)  {output_format})
)"""
    
    elif rule_type == 'findByCondition':
        column = self._sanitize_column_name(rule.get('column', 'Field'))
        operator = rule.get('operator', '>')
        value = self._format_value(rule.get('value', '0'))
        return f"""(= ({function_name} $x)
     (match &self ({column} $y $z) (if ({operator} $y  {value}) $y  ()))
)"""
    
    elif rule_type == 'findByConditionFull':
        column = self._sanitize_column_name(rule.get('column', 'Field'))
        operator = rule.get('operator', '>')
        value = self._format_value(rule.get('value', '0'))
        output_format = rule.get('output_format', '("user" $c "is" , $value)')
        return f"""(= ({function_name} $x)
     (match &self ({column} $y $z) (if ({operator} $y  {value}) (match &self ($c $y $value)  {output_format}  )  ()))
)"""
    
    else:
        return f";; Unknown advanced rule type: {rule_type}"
```

## 🎨 Frontend Changes

### 1. Update Rule Template Dropdown

Add new template options:

```javascript
// In your rule template selector
const templateOptions = [
    { value: 'flexible', label: 'Flexible Rule' },
    { value: 'match', label: 'MATCH Pattern with IF Condition' },
    { value: 'findDetail', label: 'Find Detail by ID' },
    { value: 'findByCondition', label: 'Find IDs by Condition' },
    { value: 'findByConditionFull', label: 'Find IDs by Condition (Full Details)' }
];
```

### 2. Create Advanced Rule Components

#### Component 1: FindDetailRuleForm
```jsx
const FindDetailRuleForm = ({ currentRule, setCurrentRule, columns }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                    Function Name
                </label>
                <Input
                    value={currentRule.function_name || 'findDetail'}
                    onChange={(e) => setCurrentRule({
                        ...currentRule,
                        function_name: e.target.value
                    })}
                    placeholder="e.g., findDetail"
                />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                    Output Format
                </label>
                <Input
                    value={currentRule.output_format || '("user" $c "is" , $x)'}
                    onChange={(e) => setCurrentRule({
                        ...currentRule,
                        output_format: e.target.value
                    })}
                    placeholder='e.g., ("user" $c "is" , $x)'
                />
                <p className="text-xs text-gray-600 mt-1">
                    $c = column name, $x = value
                </p>
            </div>
        </div>
    );
};
```

#### Component 2: FindByConditionRuleForm
```jsx
const FindByConditionRuleForm = ({ currentRule, setCurrentRule, columns }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                    Function Name
                </label>
                <Input
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
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                        Column
                    </label>
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
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                        Operator
                    </label>
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
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                        Value
                    </label>
                    <Input
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
```

#### Component 3: FindByConditionFullRuleForm
```jsx
const FindByConditionFullRuleForm = ({ currentRule, setCurrentRule, columns }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                    Function Name
                </label>
                <Input
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
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                        Column
                    </label>
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
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                        Operator
                    </label>
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
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                        Value
                    </label>
                    <Input
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
                <label className="block text-sm font-bold text-gray-800 mb-2">
                    Output Format
                </label>
                <Input
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
```

### 3. Update Rule Form Handler

```jsx
const renderRuleForm = () => {
    switch (currentRule.rule_type) {
        case 'findDetail':
            return <FindDetailRuleForm 
                currentRule={currentRule} 
                setCurrentRule={setCurrentRule} 
                columns={columns} 
            />;
        case 'findByCondition':
            return <FindByConditionRuleForm 
                currentRule={currentRule} 
                setCurrentRule={setCurrentRule} 
                columns={columns} 
            />;
        case 'findByConditionFull':
            return <FindByConditionFullRuleForm 
                currentRule={currentRule} 
                setCurrentRule={setCurrentRule} 
                columns={columns} 
            />;
        case 'match':
            return <MatchRuleForm 
                currentRule={currentRule} 
                setCurrentRule={setCurrentRule} 
                columns={columns} 
            />;
        default:
            return <FlexibleRuleForm 
                currentRule={currentRule} 
                setCurrentRule={setCurrentRule} 
                columns={columns} 
            />;
    }
};
```

## 📊 API Request/Response Examples

### 1. FindDetail Rule Request
```json
{
    "session_id": "abc123",
    "rule": {
        "rule_type": "findDetail",
        "function_name": "findDetail",
        "output_format": "(\"user\" $c \"is\" , $x)"
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Rule added successfully",
    "rule": {
        "id": "rule_123",
        "rule_type": "findDetail",
        "function_name": "findDetail",
        "output_format": "(\"user\" $c \"is\" , $x)",
        "preview": "(= (findDetail $id)\n     (match &self ($c $id $x)  (\"user\" $c \"is\" , $x))\n)"
    }
}
```

### 2. FindByCondition Rule Request
```json
{
    "session_id": "abc123",
    "rule": {
        "rule_type": "findByCondition",
        "function_name": "findByCondition",
        "column": "Rating",
        "operator": ">",
        "value": "6"
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Rule added successfully",
    "rule": {
        "id": "rule_124",
        "rule_type": "findByCondition",
        "function_name": "findByCondition",
        "column": "Rating",
        "operator": ">",
        "value": "6",
        "preview": "(= (findByCondition $x)\n     (match &self (Rating $y $z) (if (> $y  6) $y  ()))\n)"
    }
}
```

### 3. FindByConditionFull Rule Request
```json
{
    "session_id": "abc123",
    "rule": {
        "rule_type": "findByConditionFull",
        "function_name": "findByConditionFull",
        "column": "Rating",
        "operator": ">",
        "value": "6",
        "output_format": "(\"user\" $c \"is\" , $value)"
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Rule added successfully",
    "rule": {
        "id": "rule_125",
        "rule_type": "findByConditionFull",
        "function_name": "findByConditionFull",
        "column": "Rating",
        "operator": ">",
        "value": "6",
        "output_format": "(\"user\" $c \"is\" , $value)",
        "preview": "(= (findByConditionFull $x)\n     (match &self (Rating $y $z) (if (> $y  6) (match &self ($c $y $value)  (\"user\" $c \"is\" , $value)  )  ()))\n)"
    }
}
```

## 🧪 Query Execution Examples

### Query 1: Find Detail for ID 1
```json
{
    "session_id": "abc123",
    "query": "!(findDetail 1)"
}
```

**Response:**
```json
{
    "success": true,
    "query": "!(findDetail 1)",
    "results": [
        "(\"user\" Id \"is\" , 1)",
        "(\"user\" Name \"is\" , \"Alice\")",
        "(\"user\" Erp \"is\" , \"ERP1001\")",
        "(\"user\" FavoriteMovie \"is\" , \"Inception\")",
        "(\"user\" Genre \"is\" , \"Sci-Fi\")",
        "(\"user\" Rating \"is\" , 9)"
    ],
    "execution_time": "0.001s"
}
```

### Query 2: Find IDs with Rating > 6
```json
{
    "session_id": "abc123",
    "query": "!(findByCondition Rating)"
}
```

**Response:**
```json
{
    "success": true,
    "query": "!(findByCondition Rating)",
    "results": ["9", "7", "8", "10"],
    "execution_time": "0.002s"
}
```

### Query 3: Find Full Details for IDs with Rating > 6
```json
{
    "session_id": "abc123",
    "query": "!(findByConditionFull Rating)"
}
```

**Response:**
```json
{
    "success": true,
    "query": "!(findByConditionFull Rating)",
    "results": [
        "()",
        "(\"user\" Name \"is\" , \"George\")",
        "(\"user\" Rating \"is\" , 9)",
        "(\"user\" FavoriteMovie \"is\" , \"Parasite\")",
        "(\"user\" Id \"is\" , 7)",
        "(\"user\" Erp \"is\" , \"ERP1007\")",
        "(\"user\" Genre \"is\" , \"Thriller\")",
        "()",
        "(\"user\" Name \"is\" , \"Ian\")",
        "(\"user\" Rating \"is\" , 9)",
        "(\"user\" FavoriteMovie \"is\" , \"The Matrix\")",
        "(\"user\" Id \"is\" , 9)",
        "(\"user\" Erp \"is\" , \"ERP1009\")",
        "(\"user\" Genre \"is\" , \"Sci-Fi\")",
        "(\"user\" Name \"is\" , \"Julia\")",
        "(\"user\" Rating \"is\" , 10)",
        "(\"user\" FavoriteMovie \"is\" , \"Forrest Gump\")",
        "(\"user\" Id \"is\" , 10)",
        "(\"user\" Erp \"is\" , \"ERP1010\")",
        "(\"user\" Genre \"is\" , \"Drama\")",
        "()",
        "(\"user\" Name \"is\" , \"Helen\")",
        "(\"user\" Rating \"is\" , 8)",
        "(\"user\" FavoriteMovie \"is\" , \"La La Land\")",
        "(\"user\" Id \"is\" , 8)",
        "(\"user\" Erp \"is\" , \"ERP1008\")",
        "(\"user\" Genre \"is\" , \"Musical\")",
        "()",
        "()",
        "()"
    ],
    "execution_time": "0.003s"
}
```

## 🚀 Implementation Steps

1. **Backend**: Update `metta_service.py` with advanced rule generation
2. **Frontend**: Add 3 new rule template components
3. **UI**: Update template dropdown with new options
4. **Testing**: Test each template with sample data
5. **Documentation**: Update API documentation

## 🎯 Benefits

- **More Powerful**: Users can create complex queries easily
- **Flexible**: Customizable output formats
- **Real MeTTa**: Uses actual MeTTa interpreter
- **User-Friendly**: Simple UI for complex operations
- **Extensible**: Easy to add more templates

This implementation gives users powerful tools to create sophisticated MeTTa queries through a simple interface! 🎉
