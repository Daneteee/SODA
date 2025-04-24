export interface Transaction {
    _id: string;
    type: string;
    stock: string;
    amount: number;
    price: number;
    total: number;
    date: string;
  }