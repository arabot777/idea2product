import React, { useRef, useEffect, useState } from 'react';
import { PermissionConfigDto } from '@/lib/types/permission/permission-config.dto';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import ReactPaginate from 'react-paginate';

interface PermissionTableProps {
  permissions: PermissionConfigDto[];
  total: number;
  currentPage: number;
  pageSize: number;
  onEdit: (permission: PermissionConfigDto) => void;
  onPageChange: (page: number) => void;
}

export const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions = [],
  total = 0,
  currentPage = 1,
  pageSize = 20,
  onEdit,
  onPageChange = () => {},
}) => {
  const t = useTranslations('PermissionTable');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState(20); // Initial number of visible items
  const itemHeight = 48; // Height of each row
  const loadMoreThreshold = 100; // Load more when this many pixels from the bottom

  // Handle scroll event for infinite scrolling
  const handleScroll = () => {
    if (!tableContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    const scrollPosition = scrollTop + clientHeight;
    
    // Load more when scrolling near the bottom
    if (scrollHeight - scrollPosition < loadMoreThreshold) {
      setVisibleItems(prev => Math.min(prev + 20, permissions.length));
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [permissions.length]);

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden">
        <div 
          ref={tableContainerRef}
          className="overflow-auto"
          style={{ maxHeight: '600px' }}
        >
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-48">{t('key')}</TableHead>
                <TableHead className="w-32">{t('target')}</TableHead>
                <TableHead className="w-24">{t('scope')}</TableHead>
                <TableHead className="w-24">{t('authStatus')}</TableHead>
                <TableHead className="w-24">{t('activeStatus')}</TableHead>
                <TableHead className="w-24">{t('rejectAction')}</TableHead>
                <TableHead className="w-48">{t('title')}</TableHead>
                <TableHead className="w-64">{t('description')}</TableHead>
                <TableHead className="w-24">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission: PermissionConfigDto) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.key}</TableCell>
                  <TableCell>{permission.target}</TableCell>
                  <TableCell>{permission.scope}</TableCell>
                  <TableCell>{permission.auth_status}</TableCell>
                  <TableCell>{permission.active_status}</TableCell>
                  <TableCell>{permission.reject_action}</TableCell>
                  <TableCell>{permission.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{permission.description}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => onEdit(permission)}>
                      {t('edit')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination control */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            {t('paginationSummary', { total, currentPage, totalPages })}
          </div>
          <ReactPaginate
            previousLabel={t('previousPage')}
            nextLabel={t('nextPage')}
            breakLabel={'...'}
            pageCount={totalPages}
            forcePage={currentPage - 1} // react-paginate is 0-indexed, currentPage is 1-indexed
            marginPagesDisplayed={2} // How many pages to display at the beginning and end
            pageRangeDisplayed={3} // How many pages to display in the central part
            onPageChange={(data: { selected: number }) => onPageChange(data.selected + 1)} // onPageChange expects 1-indexed page
            containerClassName={'flex items-center space-x-px'} // Tailwind classes for the main container
            pageLinkClassName={'px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            previousLinkClassName={'px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            nextLinkClassName={'px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            breakLinkClassName={'px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}
            activeLinkClassName={'z-10 px-3 py-2 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'}
            disabledLinkClassName={'opacity-50 cursor-not-allowed'}
            // Optional: if you want to hide previous/next buttons when on first/last page instead of disabling
            // hidePrevious={currentPage === 1}
            // hideNext={currentPage === totalPages}
          />
        </div>
      )}
    </div>
  );
};