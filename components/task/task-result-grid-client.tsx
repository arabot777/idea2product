"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import ReactPaginate from "react-paginate"

import { TaskResultDto } from "@/lib/types/task/task-result.dto";
import { TaskResultTypeType } from "@/lib/types/task/enum.bean";
import { TaskResultType } from "@/lib/types/task/enum.bean";
import { TaskResultCard } from "./task-result-card";
import { getTaskResults } from "@/app/actions/task/get-task-results";

const ITEMS_PER_PAGE = 12;

interface TaskResultGridClientProps {}

export function TaskResultGridClient({}: TaskResultGridClientProps) {
  const t = useTranslations("TaskResultGridClient")
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State management
  const [taskResults, setTaskResults] = useState<TaskResultDto[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const searchStringRef = useRef<string | null>(null)

  // Parse URL parameters
  const currentPage = parseInt(searchParams.get("page") || "1")
  const currentSearch = searchParams.get("search") || undefined
  const currentType = searchParams.get("type") as TaskResultTypeType | undefined
  const taskId = searchParams.get("taskId") as string | undefined

  // Initialize search term from URL
  useEffect(() => {
    setSearchTerm(currentSearch || "")
  }, [currentSearch])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  // Update URL without page reload
  const updateURL = useCallback((params: Record<string, string | null | undefined>) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== null && value !== undefined)
    )
    const queryParams = new URLSearchParams()
    Object.entries(filteredParams).forEach(([key, value]) => {
      queryParams.set(key, value as string)
    })
    const newURL = `/${locale}/task/result?${queryParams.toString()}`
    window.history.pushState({}, "", newURL)
  }, [locale])

  // Fetch task results
  const fetchTaskResults = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, total } = await getTaskResults({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        search: currentSearch,
        filter: {
          taskId,
          type: currentType,
        },
      })
      setTaskResults(data)
      setTotal(total)
    } catch (err) {
      console.error("Error fetching task results:", err)
      setError(t("error.fetchingData") || "Failed to load data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, currentSearch, currentType, taskId, t])

  // Fetch data when URL parameters change
  useEffect(() => {
    const newSearchString = searchParams.toString()
    if (searchStringRef.current === newSearchString) {
      return
    }
    searchStringRef.current = newSearchString
    fetchTaskResults()
  }, [searchParams, fetchTaskResults])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL({
      type: currentType,
      search: searchTerm,
      page: "1",
    })
  }

  const queryAppender = (params: Record<string, string | null | undefined>) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== null && value !== undefined)
    )
    const queryParams = new URLSearchParams()
    Object.entries(filteredParams).forEach(([key, value]) => {
      queryParams.set(key, value as string)
    })
    return `/task/result?${queryParams.toString()}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {t("pageTitle")}
            </span>
          </h1>
          <p className="text-gray-400">{t("pageDescription")}</p>
        </div>

        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button type="submit" size="sm">
              {t("search")}
            </Button>
          </form>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {t("filter")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-100 text-black border-gray-200">
              <DropdownMenuItem>
                <button 
                  onClick={() => updateURL({ search: searchTerm, page: "1" })}
                  className="block w-full h-full px-2 py-1.5 hover:bg-gray-200 text-left"
                >
                  {t("all")}
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button 
                  onClick={() => updateURL({ type: TaskResultType.IMAGE, search: searchTerm, page: "1" })}
                  className="block w-full h-full px-2 py-1.5 hover:bg-gray-200 text-left"
                >
                  {t("image")}
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button 
                  onClick={() => updateURL({ type: TaskResultType.VIDEO, search: searchTerm, page: "1" })}
                  className="block w-full h-full px-2 py-1.5 hover:bg-gray-200 text-left"
                >
                  {t("video")}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-4 text-gray-400">{t('loading') || 'Loading...'}</span>
        </div>
      ) : error ? (
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
            {t('error.title') || 'Error Occurred'}
          </h3>
          <p className="text-red-400 max-w-md mx-auto">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => fetchTaskResults()}
          >
            {t('retry') || 'Retry'}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {taskResults.map((item) => (
              <TaskResultCard key={item.id} item={item} />
            ))}
          </div>

          {taskResults.length === 0 && (
            <div className="text-center py-16">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {currentSearch ? t("noMatchingRecords") : t("noRecordsYet")}
              </h3>
              <p className="text-gray-500">{currentSearch ? t("tryDifferentKeywords") : t("startYourFirstCreation")}</p>
            </div>
          )}
        </>
      )}

      {totalPages > 1 && (
        <ReactPaginate
          previousLabel={t("previous")}
          nextLabel={t("next")}
          breakLabel={t("breakLabel")}
          breakClassName={"break-me"}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={({ selected }) => {
            updateURL({ type: currentType, search: currentSearch, page: String(selected + 1) })
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
  )
}