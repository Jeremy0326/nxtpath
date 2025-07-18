import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Copy, 
  CheckCircle, 
  X, 
  Send,
  Download,
  Edit
} from 'lucide-react';

interface FollowUpEmailTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    name: string;
    title: string;
    company: string;
  };
  meetingDetails?: {
    date: string;
    topics: string[];
  };
}

export function FollowUpEmailTemplate({
  isOpen,
  onClose,
  contact,
  meetingDetails
}: FollowUpEmailTemplateProps) {
  const [copied, setCopied] = useState(false);
  const [emailContent, setEmailContent] = useState(`Dear ${contact.name},

Thank you for taking the time to speak with me at the career fair on ${meetingDetails?.date || '[Event Date]'}. I enjoyed learning more about ${contact.company} and the opportunities available.

${meetingDetails?.topics ? `We discussed ${meetingDetails.topics.join(', ')}, and I'm particularly interested in exploring the opportunities further.` : 'I\'m particularly interested in exploring the opportunities we discussed further.'}

I've attached my resume for your reference. Please let me know if you need any additional information from me.

Thank you again for your time, and I look forward to hearing from you.

Best regards,
[Your Name]
[Your Contact Information]`);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl overflow-hidden shadow-xl max-w-2xl w-full"
      >
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Follow-Up Email Template</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">To: {contact.name}</h3>
              <span className="text-xs text-gray-500">{contact.title} at {contact.company}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Subject:</h3>
              <span className="text-xs text-gray-500">Follow-Up from Career Fair - [Your Name]</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Content
              <button
                onClick={() => {}}
                className="ml-2 text-xs text-indigo-600 hover:text-indigo-500"
              >
                <Edit className="h-3 w-3 inline-block mr-1" />
                Edit
              </button>
            </label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copy to Clipboard
                  </>
                )}
              </button>
              <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </button>
            </div>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              <Send className="h-4 w-4 mr-1.5" />
              Open in Email Client
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}