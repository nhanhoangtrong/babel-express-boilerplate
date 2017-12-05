import mongoose from 'mongoose';
import { userSchema } from '../schemas/user';
import { postSchema, postCategorySchema } from '../schemas/post';
import { enquirySchema } from '../schemas/enquiry';
import { localFileSchema } from '../schemas/localFile';

export const User = mongoose.model('User', userSchema);

export const PostCategory = mongoose.model('PostCategory', postCategorySchema);
export const Post = mongoose.model('Post', postSchema);

export const Enquiry = mongoose.model('Enquiry', enquirySchema);

export const LocalFile = mongoose.model('LocalFile', localFileSchema);
