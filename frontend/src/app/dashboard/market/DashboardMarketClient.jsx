"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, TrendingUp, TrendingDown, Activity, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useWebSocket } from "@/context/WebSocketProvider"
import StatsCards from "@/components/StatsCards"
import { isMarketClosed, MarketClosedAlert } from "@/utils/marketUtils"

const DashboardMarketClient = ({ initialApiStocks, initialCredit, initialUserStocks }) => {
  const { connected, stockData: wsStockData } = useWebSocket()
  const router = useRouter()

  // Estados locales
  const [apiStocks] = useState(initialApiStocks)
  const [credit] = useState(initialCredit)
  const [userStocks] = useState(initialUserStocks)
  const [searchTerm, setSearchTerm] = useState("")
  const [transactions, setTransactions] = useState([])
  const [transactionsCount, setTransactionsCount] = useState(0)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Fetch transactions
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch("http://localhost:4000/api/transactions", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setTransactions(data.transactions.slice(0, 5)) 
          setTransactionsCount(data.transactions.length)
          setLoadingTransactions(false)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setLoadingTransactions(false)
      }
    }

    fetchTransactions()
  }, [])

  const mergedStocks = apiStocks.map((stock) => {
    const wsStock = wsStockData.find((s) => s.symbol === stock.symbol)
    return {
      ...stock,
      price: wsStock?.price ?? stock.lastYahooPrice ?? stock.firstPriceToday,
    }
  })

  const getRealtimePrice = (symbol) => {
    const ws = wsStockData.find((s) => s.symbol === symbol)
    return ws?.price ?? 0
  }

  // Añade esta función después de renderStockLogo
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredStocks = mergedStocks
  .filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )
  .sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue, bValue;
    
    switch (sortField) {
      case 'name':
        aValue = (a.name || a.symbol).toLowerCase();
        bValue = (b.name || b.symbol).toLowerCase();
        break;
      case 'price':
        aValue = a.price || 0;
        bValue = b.price || 0;
        break;
      case 'change':
        aValue = ((a.price - a.firstPriceToday) / a.firstPriceToday) * 100 || 0;
        bValue = ((b.price - b.firstPriceToday) / b.firstPriceToday) * 100 || 0;
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Cálculos de usuario
  const totalStockValue = userStocks.reduce((acc, stk) => {
    const price = getRealtimePrice(stk.symbol) || stk.purchasePrice
    return acc + price * stk.quantity
  }, 0)
  const totalInitialValue = userStocks.reduce((acc, stk) => acc + stk.purchasePrice * stk.quantity, 0)
  const gain = totalStockValue - totalInitialValue
  const gainPercent = totalInitialValue > 0 ? (gain / totalInitialValue) * 100 : 0
  const portfolioValue = credit + totalStockValue

  // Render del logo
  const renderStockLogo = (stock) => {
    if (stock.logo) {
      return (
        <div className="avatar">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={stock.logo || "/placeholder.svg"}
              alt={`${stock.symbol} logo`}
              width={32}
              height={32}
              className="object-cover"
              onError={(e) => {
                const t = e.target
                t.style.display = "none"
                t.onerror = null
              }}
            />
          </div>
        </div>
      )
    }
    return (
      <div className="avatar placeholder">
        <div className="bg-neutral text-neutral-content rounded-full w-8">
          <span>{stock.symbol.substring(0, 2)}</span>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 p-6 bg-base-200">
      <StatsCards
        portfolioValue={portfolioValue}
        gain={gain}
        gainPercent={gainPercent}
        transactionsCount={transactionsCount}
        credit={credit}
      />

      {/* Market Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Mercado en Vivo</h2>
              {connected ? (
                <span className="badge badge-accent badge-outline gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  Conectado
                </span>
              ) : (
                <span className="badge badge-error gap-1">Desconectado</span>
              )}
            </div>
            <div className="join">
              <input
                className="input input-bordered join-item w-64"
                placeholder="Buscar símbolo o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn join-item btn-primary">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {isMarketClosed() && <MarketClosedAlert />}

          {filteredStocks.length === 0 ? (
            <div className="alert alert-info">
              <span>No se encontraron acciones.</span>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[450px]">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th 
                      onClick={() => handleSort('name')}
                      className="cursor-pointer hover:bg-base-300"
                    >
                      <div className="flex items-center gap-2">
                        Activo
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('price')}
                      className="cursor-pointer hover:bg-base-300"
                    >
                      <div className="flex items-center gap-2">
                        Precio Actual
                        {sortField === 'price' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('change')}
                      className="cursor-pointer hover:bg-base-300"
                    >
                      <div className="flex items-center gap-2">
                        Cambio
                        {sortField === 'change' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => {
                    const basePrice = stock.firstPriceToday ?? stock.lastYahooPrice ?? 0;
                    const change = basePrice
                      ? ((stock.price - basePrice) / basePrice) * 100
                      : 0;
                    const isPositive = change >= 0;

                    return (
                      <tr
                        key={stock.symbol}
                        className="hover:bg-base-200 transition-colors duration-200 cursor-pointer"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            sessionStorage.setItem("selectedStock", JSON.stringify(stock))
                          }
                          router.push(`/dashboard/market/${stock.symbol}`)
                        }}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            {renderStockLogo(stock)}
                            <div>
                              <div className="font-bold">{stock.name || stock.symbol}</div>
                              <div className="text-sm opacity-50">{stock.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono font-bold">{stock.price !== undefined ? `$${stock.price.toFixed(2)}` : "N/A"}</td>
                        <td>
                          <div
                            className={`flex items-center gap-1 font-bold ${
                              isPositive ? "text-success" : "text-error"
                            }`}
                          >
                            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {stock.firstPriceToday ? `${change.toFixed(2)}%` : "N/A"}
                          </div>
                        </td>
                        <td>
                          <button 
                            className={`btn btn-sm btn-success text-white mr-2 ${isMarketClosed() ? 'btn-disabled' : ''}`}
                            disabled={isMarketClosed()}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isMarketClosed()) {
                                if (typeof window !== "undefined") {
                                  sessionStorage.setItem("selectedStock", JSON.stringify(stock))
                                }
                                router.push(`/dashboard/market/${stock.symbol}?action=buy`)
                              }
                            }}
                          >
                            Comprar
                          </button>
                          <button 
                            className={`btn btn-sm btn-error text-white ${isMarketClosed() ? 'btn-disabled' : ''}`}
                            disabled={isMarketClosed()}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isMarketClosed()) {
                                if (typeof window !== "undefined") {
                                  sessionStorage.setItem("selectedStock", JSON.stringify(stock))
                                }
                                router.push(`/dashboard/market/${stock.symbol}?action=sell`)
                              }
                            }}
                          >
                            Vender
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default DashboardMarketClient