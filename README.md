# Yaung Wel

> A modern, full-stack secondhand marketplace platform built with Next.js that enables users to buy and sell pre-owned items seamlessly. The platform provides a comprehensive solution for peer-to-peer commerce with a focus on user experience and security.

## Team Members

- Swan Htet Aung ([@haoz20](https://github.com/haoz20)) — [Repo](https://github.com/haoz20/haoz20.github.io)
- Thiri Htet ([@Thiri-htet04](https://github.com/Thiri-htet04)) — [Repo](https://github.com/Thiri-htet04/Thiri-htet04.github.io)
- Kaung Myat San ([@Kaungms](https://github.com/Kaungms)) - [Repo](https://github.com/Kaungms/Kaungms.github.io)

## Project Description

### Key Features

#### 🔐 **User Management**

Manage your account securely and interact with other users.
- Register and log in using **NextAuth.js**
- Edit and update user profiles
- Manage passwords and account security
- Discover and browse community members

#### 📦 **Product Management**

Easily create and manage listings for secondhand items.
- Upload multiple product images  
- Categorize items (Electronics, Clothing, Books, Furniture, Sports, Toys, Automotive, Home, Other) 
- Set pricing based on condition (New, Like New, Good, Fair, Poor)  
- Edit, delete, or mark items as sold  

#### 🛒 **Order System**

Handle transactions between buyers and sellers efficiently.
- Buyers can place orders for available products  
- Sellers can confirm, cancel, or mark orders as completed  
- Order status tracking (Pending → Confirmed → Cancelled)  
- View transaction history in user dashboard 

#### 🖼️ **Media Management**

- Upload and preview multiple product images  
- **Cloudinary** integration for optimized image storage and delivery  
- Responsive image display with zoom and lightbox support  

#### 💻 **Modern User Interface**

- Fully responsive design for mobile and desktop  
- Styled with **Tailwind CSS** for a clean and modern layout  
- Smooth navigation with loading states and error handling  
- Interactive product galleries and intuitive browsing  
- Loading states and error handling for better UX

#### 🔍 **Browse & Discover**

- Filter, sort, and search products easily  
- Homepage showcase of featured items  
- Individual product detail pages with user info and listing stats  
- View all listings from a specific user  

## ⚙️ CRUD Functionalities

Our system fully supports **Create, Read, Update, and Delete** operations across all major modules.

### 🧍‍♂️ User Management
| Operation | Description |
|------------|--------------|
| **Create** | Users can register new accounts through secure authentication. |
| **Read** | View user profiles and browse other community members. |
| **Update** | Edit personal information, change passwords, and manage profiles. |
| **Delete** | Users can delete their accounts if they wish to leave the platform. |

### 📦 Product Management
| Operation | Description |
|------------|--------------|
| **Create** | Sellers can list new products with details and multiple images. |
| **Read** | Buyers can browse all product listings and view item details. |
| **Update** | Sellers can edit product info, update price, or mark items as sold. |
| **Delete** | Sellers can remove listings that are no longer available. |

### 🛒 Order Management
| Operation | Description |
|------------|--------------|
| **Create** | Buyers can place orders for available products. |
| **Read** | Both buyers and sellers can view order details and history. |
| **Update** | Order status can be updated (Pending → Confirmed → Completed). |
| **Delete** | Cancelled orders are removed from active lists. |


## Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white)
![Azure DevOps](https://img.shields.io/badge/Azure%20DevOps-0078D7?logo=azure-devops&logoColor=white)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
