// src/pages/producer/ProducerProductsPage.jsx
import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

/**
 * 상품 관리 탭
 * - GET  /api/producer/products
 *   → ProducerProductItemDto[]
 *   → { productId, detailId, productName, unitName, price, stockQty, status, updatedDate }
 *
 * - PATCH /api/producer/products/details/{detailId}
 *   body: { unitName, price, stockQty }
 */
export default function ProducerProductsPage() {
  const { auth } = useContext(AuthContext)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null) // 재고 히스토리용 (나중에 API 연동)

  useEffect(() => {
    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    if (!token) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await axios.get(`${API_BASE}/api/producer/products`, {
          headers,
        })

        // 백엔드: ProducerProductItemDto[]
        const list = Array.isArray(res.data) ? res.data : []
        setProducts(
          list.map((p) => ({
            ...p,
            // 안전하게 숫자 보장
            price: p.price ?? 0,
            stockQty: p.stockQty ?? 0,
          })),
        )
      } catch (err) {
        console.error('생산자 상품 목록 조회 에러:', err)
        setError('상품 목록을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [auth])

  const handleChangeField = (detailId, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.detailId === detailId ? { ...p, [field]: value } : p,
      ),
    )
  }

  const handleSaveProduct = async (product) => {
    const token =
      auth?.accessToken ||
      auth?.token ||
      localStorage.getItem('accessToken')

    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      setSavingId(product.detailId)

      await axios.patch(
        `${API_BASE}/api/producer/products/details/${product.detailId}`,
        {
          unitName: product.unitName,
          price: product.price,
          stockQty: product.stockQty,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
        },
      )

      alert('상품 정보가 저장되었습니다.')
      // updatedDate만 갱신해도 되고, 필요하면 다시 목록 조회해도 됨
      setProducts((prev) =>
        prev.map((p) =>
          p.detailId === product.detailId
            ? { ...p, updatedDate: new Date().toISOString() }
            : p,
        ),
      )
    } catch (err) {
      console.error('상품 저장 에러:', err)
      alert('상품 정보를 저장하는 중 오류가 발생했습니다.')
    } finally {
      setSavingId(null)
    }
  }

  const handleClickStockHistory = (product) => {
    // TODO: 재고 히스토리 조회 API 연동 예정
    setSelectedProduct(product)
  }

  if (loading) return <div>상품 정보를 불러오는 중입니다...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div className="producer-products-page">
      <h2>상품 관리</h2>

      <section>
        <h3>내 상품 목록</h3>
        {products.length === 0 ? (
          <p>등록된 상품이 없습니다.</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>규격(단위)</th>
                <th>가격</th>
                <th>재고</th>
                <th>상태</th>
                <th>재고 히스토리</th>
                <th>저장</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.detailId}>
                  <td>{p.productName}</td>
                  <td>
                    <input
                      type="text"
                      value={p.unitName || ''}
                      onChange={(e) =>
                        handleChangeField(p.detailId, 'unitName', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={p.price}
                      onChange={(e) =>
                        handleChangeField(
                          p.detailId,
                          'price',
                          Number(e.target.value),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={p.stockQty}
                      onChange={(e) =>
                        handleChangeField(
                          p.detailId,
                          'stockQty',
                          Number(e.target.value),
                        )
                      }
                    />
                  </td>
                  <td>{p.status}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleClickStockHistory(p)}
                    >
                      보기
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      disabled={savingId === p.detailId}
                      onClick={() => handleSaveProduct(p)}
                    >
                      {savingId === p.detailId ? '저장 중...' : '저장'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h3>재고 현황 (간단 요약)</h3>
        {products.length === 0 ? (
          <p>표시할 상품이 없습니다.</p>
        ) : (
          <ul>
            {products.map((p) => (
              <li key={p.detailId}>
                {p.productName} ({p.unitName}) : {p.stockQty}개
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedProduct && (
        <section className="stock-history-section">
          <h3>
            {selectedProduct.productName} ({selectedProduct.unitName}) 재고
            히스토리
          </h3>
          <p>재고 변동 기록을 여기에 표시할 예정입니다. (추후 API 연동)</p>
          <button type="button" onClick={() => setSelectedProduct(null)}>
            닫기
          </button>
        </section>
      )}
    </div>
  )
}