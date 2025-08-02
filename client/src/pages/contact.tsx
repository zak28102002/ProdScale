import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, MessageSquare, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleContact = (type: string) => {
    toast({
      title: "Coming Soon!",
      description: `${type} support will be available in the next update.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-sm mx-auto pb-24"
    >
      <div className="flex items-center mb-6">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-black dark:text-white">Contact Us</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        We'd love to hear from you! Choose how you'd like to get in touch.
      </p>

      <div className="space-y-4">
        <Button
          onClick={() => handleContact("Email")}
          variant="outline"
          className="w-full justify-start h-16 px-6 bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <Mail className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
          <div className="text-left">
            <h3 className="font-semibold text-black dark:text-white">Email Support</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">support@prodscale.app</p>
          </div>
        </Button>

        <Button
          onClick={() => handleContact("Feedback")}
          variant="outline"
          className="w-full justify-start h-16 px-6 bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <MessageSquare className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
          <div className="text-left">
            <h3 className="font-semibold text-black dark:text-white">Send Feedback</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Help us improve ProdScale</p>
          </div>
        </Button>

        <Button
          onClick={() => handleContact("Bug report")}
          variant="outline"
          className="w-full justify-start h-16 px-6 bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <Bug className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
          <div className="text-left">
            <h3 className="font-semibold text-black dark:text-white">Report a Bug</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Let us know what's not working</p>
          </div>
        </Button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-black dark:text-white mb-2">Response Time</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We typically respond within 24-48 hours during business days.
        </p>
      </div>
    </motion.div>
  );
}