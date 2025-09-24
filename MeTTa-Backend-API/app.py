from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import json
from datetime import datetime, timedelta
import tempfile
import shutil

from services.csv_service import CSVService
from services.rule_service import RuleService
from services.metta_service import MeTTaService
from models.session import SessionManager
from utils.validators import Validators

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",  # Next.js dev server
    "http://localhost:3001",
    "https://yourdomain.com",
    "http://localhost:3002"
])

# Configuration
app.config['UPLOAD_FOLDER'] = './temp'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['SESSION_TIMEOUT'] = 3600  # 1 hour

# Initialize services
csv_service = CSVService()
rule_service = RuleService()
metta_service = MeTTaService()
session_manager = SessionManager()
validators = Validators()

# Ensure temp directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'success': False,
        'error': {
            'code': 'FILE_TOO_LARGE',
            'message': 'File size exceeds 16MB limit'
        }
    }), 413

@app.errorhandler(400)
def bad_request(e):
    return jsonify({
        'success': False,
        'error': {
            'code': 'BAD_REQUEST',
            'message': 'Invalid request format'
        }
    }), 400

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'success': False,
        'error': {
            'code': 'INTERNAL_ERROR',
            'message': 'Internal server error'
        }
    }), 500

# =============================================================================
# CSV Upload & Processing Routes
# =============================================================================

@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    """Upload CSV file and extract columns."""
    try:
        if 'csv' not in request.files:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_FILE',
                    'message': 'No CSV file provided'
                }
            }), 400

        file = request.files['csv']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_FILE',
                    'message': 'No file selected'
                }
            }), 400

        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Process CSV
        result = csv_service.process_csv(file, session_id, app.config['UPLOAD_FOLDER'])
        
        if not result['success']:
            return jsonify(result), 400

        # Create session
        session_manager.create_session(session_id, result['data'])
        
        # Process CSV data for MeTTa generation
        csv_data_result = csv_service.get_csv_data(result['data']['file_path'])
        if csv_data_result['success']:
            session_manager.set_csv_data(session_id, csv_data_result)
        else:
            # Log error but don't fail the upload
            app.logger.warning(f"Failed to process CSV data for session {session_id}: {csv_data_result.get('error', {}).get('message', 'Unknown error')}")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'columns': result['data']['columns'],
            'total_rows': result['data']['total_rows'],
            'preview': result['data']['preview']
        })

    except Exception as e:
        app.logger.error(f"CSV upload error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'UPLOAD_ERROR',
                'message': 'Failed to process CSV file'
            }
        }), 500

@app.route('/api/set-id-column', methods=['POST'])
def set_id_column():
    """Set the ID column for the session."""
    try:
        data = request.get_json()
        
        # Validate input
        validation_result = validators.validate_id_column_request(data)
        if not validation_result['valid']:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': validation_result['message']
                }
            }), 400

        session_id = data['session_id']
        id_column = data['id_column']

        # Check if session exists
        if not session_manager.session_exists(session_id):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SESSION_NOT_FOUND',
                    'message': 'Session not found or expired'
                }
            }), 404

        # Update session
        session_manager.set_id_column(session_id, id_column)

        return jsonify({
            'success': True,
            'id_column': id_column,
            'message': 'ID column set successfully'
        })

    except Exception as e:
        app.logger.error(f"Set ID column error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Failed to set ID column'
            }
        }), 500

# =============================================================================
# Rule Management Routes
# =============================================================================

@app.route('/api/add-rule', methods=['POST'])
def add_rule():
    """Add a rule to the session."""
    try:
        data = request.get_json()
        
        # Validate input
        validation_result = validators.validate_rule_request(data)
        if not validation_result['valid']:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': validation_result['message']
                }
            }), 400

        session_id = data['session_id']
        rule = data['rule']

        # Check if session exists
        if not session_manager.session_exists(session_id):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SESSION_NOT_FOUND',
                    'message': 'Session not found or expired'
                }
            }), 404

        # Add rule
        rule_id = rule_service.add_rule(session_id, rule)
        rules_count = rule_service.get_rules_count(session_id)
        
        # Generate preview
        preview = metta_service.generate_rule_preview(rule)

        return jsonify({
            'success': True,
            'rule_id': rule_id,
            'rules_count': rules_count,
            'preview': preview
        })

    except Exception as e:
        app.logger.error(f"Add rule error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'RULE_ERROR',
                'message': 'Failed to add rule'
            }
        }), 500

@app.route('/api/rules/<session_id>', methods=['GET'])
def get_rules(session_id):
    """Get all rules for a session."""
    try:
        # Check if session exists
        if not session_manager.session_exists(session_id):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SESSION_NOT_FOUND',
                    'message': 'Session not found or expired'
                }
            }), 404

        rules = rule_service.get_rules(session_id)
        rules_count = len(rules)

        return jsonify({
            'success': True,
            'rules': rules,
            'rules_count': rules_count
        })

    except Exception as e:
        app.logger.error(f"Get rules error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Failed to get rules'
            }
        }), 500

@app.route('/api/remove-rule', methods=['DELETE'])
def remove_rule():
    """Remove a rule from the session."""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'session_id' not in data or 'rule_id' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Missing session_id or rule_id'
                }
            }), 400

        session_id = data['session_id']
        rule_id = data['rule_id']

        # Check if session exists
        if not session_manager.session_exists(session_id):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SESSION_NOT_FOUND',
                    'message': 'Session not found or expired'
                }
            }), 404

        # Remove rule
        success = rule_service.remove_rule(session_id, rule_id)
        if not success:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'RULE_NOT_FOUND',
                    'message': 'Rule not found'
                }
            }), 404

        rules_count = rule_service.get_rules_count(session_id)

        return jsonify({
            'success': True,
            'message': 'Rule removed successfully',
            'rules_count': rules_count
        })

    except Exception as e:
        app.logger.error(f"Remove rule error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Failed to remove rule'
            }
        }), 500

# =============================================================================
# MeTTa Generation & Preview Routes
# =============================================================================

@app.route('/api/generate-metta', methods=['POST'])
def generate_metta():
    """Generate MeTTa file from CSV data and rules."""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Missing session_id'
                }
            }), 400

        session_id = data['session_id']

        # Check if session exists
        if not session_manager.session_exists(session_id):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SESSION_NOT_FOUND',
                    'message': 'Session not found or expired'
                }
            }), 404

        # Generate MeTTa content
        result = metta_service.generate_metta_file(session_id, session_manager, rule_service)
        
        if not result['success']:
            return jsonify(result), 400

        # Store generated content in session
        session_manager.set_generated_metta(session_id, result['metta_content'])

        return jsonify({
            'success': True,
            'metta_content': result['metta_content'],
            'file_size': result['file_size'],
            'lines_count': result['lines_count'],
            'facts_count': result['facts_count'],
            'rules_count': result['rules_count'],
            'download_url': f'/api/download-metta/{session_id}'
        })

    except Exception as e:
        app.logger.error(f"Generate MeTTa error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'GENERATION_ERROR',
                'message': 'Failed to generate MeTTa file'
            }
        }), 500

@app.route('/api/metta-preview/<session_id>', methods=['GET'])
def metta_preview(session_id):
    """Get preview of generated MeTTa file."""
    try:
        # Check if session exists
        if not session_manager.session_exists(session_id):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SESSION_NOT_FOUND',
                    'message': 'Session not found or expired'
                }
            }), 404

        # Get generated content
        metta_content = session_manager.get_generated_metta(session_id)
        if not metta_content:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_CONTENT',
                    'message': 'No MeTTa content generated yet'
                }
            }), 404

        # Calculate stats
        lines = metta_content.split('\n')
        facts_count = len([line for line in lines if line.strip() and not line.startswith(';') and not line.startswith('=') and not line.startswith('!')])
        rules_count = len([line for line in lines if line.strip().startswith('=')])

        return jsonify({
            'success': True,
            'metta_content': metta_content,
            'stats': {
                'total_lines': len(lines),
                'facts_count': facts_count,
                'rules_count': rules_count,
                'file_size': f"{len(metta_content.encode('utf-8')) / 1024:.1f} KB"
            }
        })

    except Exception as e:
        app.logger.error(f"MeTTa preview error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Failed to get MeTTa preview'
            }
        }), 500

# =============================================================================
# Query Execution Routes
# =============================================================================

@app.route('/api/execute-query', methods=['POST'])
def execute_query():
    """Execute MeTTa query on generated knowledge base."""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'session_id' not in data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Missing session_id or query'
                }
            }), 400

        session_id = data['session_id']
        query = data['query']

        # Check if session exists
        if not session_manager.session_exists(session_id):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SESSION_NOT_FOUND',
                    'message': 'Session not found or expired'
                }
            }), 404

        # Execute query
        result = metta_service.execute_query(session_id, query, session_manager, rule_service)
        
        if not result['success']:
            return jsonify(result), 400

        return jsonify({
            'success': True,
            'query': query,
            'results': result['results'],
            'execution_time': result['execution_time'],
            'message': 'Query executed successfully'
        })

    except Exception as e:
        app.logger.error(f"Execute query error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'QUERY_ERROR',
                'message': 'Failed to execute query'
            }
        }), 500

# =============================================================================
# Download & Export Routes
# =============================================================================

@app.route('/api/download-metta/<session_id>', methods=['GET'])
def download_metta(session_id):
    """Download generated MeTTa file."""
    try:
        # Check if session exists
        if not session_manager.session_exists(session_id):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SESSION_NOT_FOUND',
                    'message': 'Session not found or expired'
                }
            }), 404

        # Get generated content
        metta_content = session_manager.get_generated_metta(session_id)
        if not metta_content:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_CONTENT',
                    'message': 'No MeTTa content generated yet'
                }
            }), 404

        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.metta', delete=False)
        temp_file.write(metta_content)
        temp_file.close()

        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=f'knowledge_base_{session_id}.metta',
            mimetype='text/plain'
        )

    except Exception as e:
        app.logger.error(f"Download MeTTa error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'DOWNLOAD_ERROR',
                'message': 'Failed to download MeTTa file'
            }
        }), 500

@app.route('/api/print-terminal', methods=['POST'])
def print_terminal():
    """Print MeTTa content to terminal (for development)."""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Missing session_id'
                }
            }), 400

        session_id = data['session_id']

        # Check if session exists
        if not session_manager.session_exists(session_id):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SESSION_NOT_FOUND',
                    'message': 'Session not found or expired'
                }
            }), 404

        # Get generated content
        metta_content = session_manager.get_generated_metta(session_id)
        if not metta_content:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_CONTENT',
                    'message': 'No MeTTa content generated yet'
                }
            }), 404

        # Print to terminal
        print(f"\n{'='*50}")
        print(f"MeTTa Content for Session: {session_id}")
        print(f"{'='*50}")
        print(metta_content)
        print(f"{'='*50}\n")

        lines_count = len(metta_content.split('\n'))

        return jsonify({
            'success': True,
            'message': 'Content printed to terminal',
            'printed_lines': lines_count
        })

    except Exception as e:
        app.logger.error(f"Print terminal error: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Failed to print to terminal'
            }
        }), 500

# =============================================================================
# Health Check
# =============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    metta_status = metta_service.get_metta_status()
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'metta_interpreter': metta_status
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
