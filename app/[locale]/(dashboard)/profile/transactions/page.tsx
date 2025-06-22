"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserTransactions } from '@/app/actions/billing/get-user-transactions';
import { listSubscriptionPlans } from '@/app/actions/billing/list-subscription-plans';
import { TransactionDto } from '@/lib/types/payment/transaction.dto';
import { SubscriptionPlanDto } from '@/lib/types/billing/subscription-plan.dto';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import ReactPaginate from 'react-paginate';

const ITEMS_PER_PAGE = 10;

export default function ProfileTransactionsPage() {
  const t = useTranslations('ProfileTransactions');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchStringRef = useRef<string | null>(null);

  // Parse URL parameters
  const currentPage = parseInt(searchParams.get("page") || "1");

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Update URL without page reload
  const updateURL = useCallback((params: Record<string, string | null | undefined>) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== null && value !== undefined)
    );
    const queryParams = new URLSearchParams();
    Object.entries(filteredParams).forEach(([key, value]) => {
      queryParams.set(key, value as string);
    });
    const newURL = `/profile/transactions?${queryParams.toString()}`;
    window.history.pushState({}, "", newURL);
  }, []);

  // Fetch transactions
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        transactionsResult,
        subscriptionPlansData,
      ] = await Promise.all([
        getUserTransactions({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE
        }),
        listSubscriptionPlans(),
      ]);

      setTransactions(transactionsResult.data || []);
      setTotal(transactionsResult.total);
      setSubscriptionPlans(subscriptionPlansData || []);

    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || t('error') || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, t]);

  // Fetch data when URL parameters change
  useEffect(() => {
    const newSearchString = searchParams.toString();
    if (searchStringRef.current === newSearchString) {
      return;
    }
    searchStringRef.current = newSearchString;
    fetchData();
  }, [searchParams, fetchData]);

  // Helper function: Find the corresponding subscription plan or premium package name based on productId in the transaction
  const getItemName = (productId: string) => {
    const subscription = subscriptionPlans.find(plan => plan.id === productId);
    if (subscription) {
      return subscription.name;
    }
    return t('unknownItem');
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('myTransactionsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-4 text-gray-400">{t('loading') || 'Loading...'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('myTransactionsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-500 mb-2">
              {t('errorTitle') || 'Error Occurred'}
            </h3>
            <p className="text-red-400 max-w-md mx-auto">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fetchData()}
            >
              {t('retry') || 'Retry'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-xl text-white">{t('myTransactionsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Transaction History Table */}
          {transactions.length > 0 ? (
            <Table>
              <TableCaption>{t('transactionHistoryCaption')}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] text-slate-300">{t('transactionId')}</TableHead>
                  <TableHead className="text-slate-300">{t('itemName')}</TableHead>
                  <TableHead className="text-slate-300">{t('amount')}</TableHead>
                  <TableHead className="text-slate-300">{t('type')}</TableHead>
                  <TableHead className="text-slate-300">{t('status')}</TableHead>
                  <TableHead className="text-right text-slate-300">{t('transactionDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{getItemName(transaction.associatedId)}</TableCell>
                    <TableCell>{t('amountSymbol')}{transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{t(transaction.type)}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {t(transaction.status.toLowerCase())}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {t('noTransactions') || 'No transactions found'}
              </h3>
              <p className="text-gray-500">{t('noTransactionsDescription') || 'You have not made any transactions yet.'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <ReactPaginate
          previousLabel={t("previous") || "Previous"}
          nextLabel={t("next") || "Next"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={({ selected }) => {
            updateURL({ page: String(selected + 1) });
          }}
          containerClassName={"flex justify-center items-center space-x-2 mt-8"}
          pageClassName={"px-3 py-1 rounded-md text-gray-300 hover:bg-gray-700"}
          pageLinkClassName={"block"}
          activeClassName={"bg-purple-600 text-white"}
          previousClassName={"px-3 py-1 rounded-md text-gray-300 hover:bg-gray-700"}
          nextClassName={"px-3 py-1 rounded-md text-gray-300 hover:bg-gray-700"}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          forcePage={currentPage - 1} // react-paginate is 0-indexed
        />
      )}
    </div>
  );
}