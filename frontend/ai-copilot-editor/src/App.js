import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Alert, Spinner, Nav, Navbar } from 'react-bootstrap';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [transformedText, setTransformedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get API URL from environment or use default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005';

  const editor = useEditor({
    extensions: [StarterKit, BubbleMenu],
    content: '<p>👋 Welcome to AI Copilot Editor! Select any text to see AI-powered actions.</p>',
  });

  const handleAIAction = async (action) => {
    if (!editor) return;

    const selectedText = editor.state.selection.$from.parent.textContent || '';
    
    if (!selectedText || selectedText.trim().length === 0) {
      setError('Please select text to transform');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const endpoint = action === 'shorter' ? '/api/make-shorter' : '/api/make-longer';
      const response = await axios.post(`${API_URL}${endpoint}`, { text: selectedText });
      
      if (response.data.result) {
        setTransformedText(response.data.result);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to process text';
      setError(errorMsg);
      console.error('AI action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" sticky="top" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#" className="fw-bold">
            <i className="bi bi-magic"></i> AI Copilot Editor
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="#about" className="text-light">
              About
            </Nav.Link>
            <Nav.Link href="#help" className="text-light">
              Help
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col lg={10} className="mx-auto">
            <div className="page-header mb-4">
              <h1 className="mb-2">
                <i className="bi bi-pencil-square"></i> Professional Text Editor
              </h1>
              <p className="text-muted">
                Enhance your writing with AI-powered text transformation
              </p>
            </div>
          </Col>
        </Row>

        <Row className="g-3">
          {/* Editor Column */}
          <Col lg={8} className="mx-auto">
            <Card className="shadow-sm editor-card">
              <Card.Header className="bg-light border-bottom">
                <h5 className="mb-0">
                  <i className="bi bi-file-text"></i> Editor
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="editor-container">
                  {editor && (
                    <BubbleMenu
                      editor={editor}
                      tippyOptions={{ duration: 100 }}
                      className="bubble-menu"
                    >
                      <button
                        onClick={() => handleAIAction('shorter')}
                        disabled={loading}
                        className="btn btn-sm btn-primary me-2"
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-arrow-down"></i> Shorter
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleAIAction('longer')}
                        disabled={loading}
                        className="btn btn-sm btn-success"
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-arrow-up"></i> Longer
                          </>
                        )}
                      </button>
                    </BubbleMenu>
                  )}
                  <EditorContent editor={editor} className="tiptap-editor" />
                </div>
              </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div className="mt-4 d-flex gap-2 justify-content-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleAIAction('shorter')}
                disabled={loading || !editor}
                className="px-4"
              >
                <i className="bi bi-arrow-down"></i> Make Shorter
              </Button>
              <Button
                variant="success"
                size="lg"
                onClick={() => handleAIAction('longer')}
                disabled={loading || !editor}
                className="px-4"
              >
                <i className="bi bi-arrow-up"></i> Make Longer
              </Button>
            </div>

            {/* Alerts */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
                <i className="bi bi-exclamation-circle"></i> {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess(false)} className="mt-3">
                <i className="bi bi-check-circle"></i> Text transformed successfully!
              </Alert>
            )}

            {/* Result Display */}
            {transformedText && (
              <Card className="mt-4 shadow-sm">
                <Card.Header className="bg-light border-bottom">
                  <h5 className="mb-0">
                    <i className="bi bi-arrow-repeat"></i> Transformed Result
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <p className="result-text mb-3">{transformedText}</p>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(transformedText);
                        setSuccess(true);
                        setTimeout(() => setSuccess(false), 2000);
                      }}
                    >
                      <i className="bi bi-clipboard"></i> Copy
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setTransformedText('')}
                    >
                      <i className="bi bi-x"></i> Clear
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Info Sidebar */}
          <Col lg={4} className="d-none d-lg-block">
            <Card className="shadow-sm mb-3 sticky-top" style={{ top: '80px' }}>
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle"></i> Quick Guide
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="feature-list">
                  <div className="feature-item mb-3">
                    <h6 className="mb-2">
                      <i className="bi bi-1-circle"></i> Get Started
                    </h6>
                    <p className="small text-muted">Type or paste your text in the editor above</p>
                  </div>
                  <hr />
                  <div className="feature-item mb-3">
                    <h6 className="mb-2">
                      <i className="bi bi-2-circle"></i> Select Text
                    </h6>
                    <p className="small text-muted">Highlight any portion of your text</p>
                  </div>
                  <hr />
                  <div className="feature-item mb-3">
                    <h6 className="mb-2">
                      <i className="bi bi-3-circle"></i> Transform
                    </h6>
                    <p className="small text-muted">Choose to make it shorter or longer using AI</p>
                  </div>
                  <hr />
                  <div className="feature-item">
                    <h6 className="mb-2">
                      <i className="bi bi-4-circle"></i> Copy Result
                    </h6>
                    <p className="small text-muted">Copy the transformed text to use it</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-gear"></i> Features
                </h5>
              </Card.Header>
              <Card.Body className="small">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bi bi-check text-success"></i> AI-powered text processing
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check text-success"></i> Real-time editing
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check text-success"></i> Responsive design
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check text-success"></i> One-click copy
                  </li>
                  <li>
                    <i className="bi bi-check text-success"></i> Beautiful UI
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-light border-top py-4 mt-5">
        <Container>
          <Row className="text-center text-muted small">
            <Col>
              <p className="mb-0">
                © 2025 AI Copilot Editor. Built with <i className="bi bi-heart-fill text-danger"></i> React & Bootstrap
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default App;
