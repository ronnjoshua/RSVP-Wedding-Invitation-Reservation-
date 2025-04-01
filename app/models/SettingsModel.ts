import mongoose from 'mongoose';

// Define the schema for event location
const eventLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Venue name is required']
  },
  address: {
    type: String,
    required: [true, 'Venue address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: false
  },
  zipCode: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  googleMapsUrl: {
    type: String,
    required: false
  }
});

// Define the schema for email settings
const emailSettingsSchema = new mongoose.Schema({
  senderEmail: {
    type: String,
    required: [true, 'Sender email is required'],
    match: [/.+\@.+\..+/, 'Please provide a valid email address']
  },
  senderName: {
    type: String,
    required: [true, 'Sender name is required']
  },
  invitationSubject: {
    type: String,
    required: [true, 'Invitation email subject is required'],
    default: "You're Invited!"
  },
  invitationTemplate: {
    type: String,
    required: [true, 'Invitation email template is required']
  },
  reminderSubject: {
    type: String,
    required: [true, 'Reminder email subject is required'],
    default: "RSVP Reminder"
  },
  reminderTemplate: {
    type: String,
    required: [true, 'Reminder email template is required']
  }
});

// Define the schema for customization
const customizationSchema = new mongoose.Schema({
  primaryColor: {
    type: String,
    required: [true, 'Primary color is required'],
    default: '#0A5741'
  },
  secondaryColor: {
    type: String,
    required: [true, 'Secondary color is required'],
    default: '#F59E0B'
  },
  fontFamily: {
    type: String,
    required: [true, 'Font family is required'],
    default: 'Cormorant Garamond, serif'
  },
  logoUrl: {
    type: String,
    required: false
  },
  backgroundImageUrl: {
    type: String,
    required: false
  }
});

// Define the schema for FAQs
const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'FAQ question is required']
  },
  answer: {
    type: String,
    required: [true, 'FAQ answer is required']
  }
});

// Define the schema for additional info
const additionalInfoSchema = new mongoose.Schema({
  accommodations: {
    type: String,
    required: false
  },
  dress_code: {
    type: String,
    required: false
  },
  registry: {
    type: String,
    required: false
  },
  faqs: {
    type: [faqSchema],
    default: []
  }
});

// Define the main settings schema
const settingsSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  eventLocation: {
    type: eventLocationSchema,
    required: [true, 'Event location is required']
  },
  rsvpDeadline: {
    type: Date,
    required: [true, 'RSVP deadline is required']
  },
  maxGuestsAllowed: {
    type: Number,
    required: [true, 'Maximum allowed guests is required'],
    default: 100,
    min: 1
  },
  emailSettings: {
    type: emailSettingsSchema,
    required: [true, 'Email settings are required']
  },
  customization: {
    type: customizationSchema,
    required: [true, 'Customization settings are required']
  },
  additionalInfo: {
    type: additionalInfoSchema,
    required: false,
    default: {}
  }
}, {
  timestamps: true
});

// Define the Settings model
const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default SettingsModel;

// Export TypeScript interfaces
export interface EventLocation {
  name: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  googleMapsUrl?: string;
}

export interface EmailSettings {
  senderEmail: string;
  senderName: string;
  invitationSubject: string;
  invitationTemplate: string;
  reminderSubject: string;
  reminderTemplate: string;
}

export interface Customization {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface AdditionalInfo {
  accommodations?: string;
  dress_code?: string;
  registry?: string;
  faqs?: FAQ[];
}

export interface Settings {
  _id?: string;
  eventName: string;
  eventDate: Date;
  eventLocation: EventLocation;
  rsvpDeadline: Date;
  maxGuestsAllowed: number;
  emailSettings: EmailSettings;
  customization: Customization;
  additionalInfo?: AdditionalInfo;
  createdAt?: Date;
  updatedAt?: Date;
}