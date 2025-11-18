// src/pages/producer/ProducerProductsPage.jsx
import { useEffect, useState } from 'react'

export default function ProducerProductsPage() {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    // TODO: 내 상품 목록 API 호출
    setProducts([
      {
        id: 1,
        name: '사과 5kg',
        price: 25000,
        stock: 12,
      },
      {
        id: 2,
        name: '배 3kg',
        price: 18000,
        stock: 3,
      },
    ])
  }, [])

  const handleChangeField = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    )
  }

  const handleSaveProduct = (product) => {
    // TODO: 가격/재고 업데이트 API
    alert(`상품(${product.name}) 정보 저장`)
  }

  const handleClickStockHistory = (product) => {
    // TODO: 재고 히스토리 조회 (기간 지정은 나중에 UI 추가)
    setSelectedProduct(product)
  }

  return (
    <div className="producer-products-page">
      <h2>상품 관리</h2>

      <section>
        <h3>내 상품 목록</h3>
        <table className="products-table">
          <thead>
            <tr>
              <th>상품명</th>
              <th>가격</th>
              <th>재고</th>
              <th>재고 히스토리</th>
              <th>저장</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) =>
                      handleChangeField(p.id, 'price', Number(e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={p.stock}
                    onChange={(e) =>
                      handleChangeField(p.id, 'stock', Number(e.target.value))
                    }
                  />
                </td>
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
                    onClick={() => handleSaveProduct(p)}
                  >
                    저장
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>재고 현황 (간단 요약)</h3>
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.name} : {p.stock}개
            </li>
          ))}
        </ul>
      </section>

      {selectedProduct && (
        <section className="stock-history-section">
          <h3>
            {selectedProduct.name} 재고 히스토리 (기간 지정 UI 나중에 추가)
          </h3>
          {/* TODO: 기간 선택 + 그래프 or 리스트 */}
          <p>재고 변동 기록을 여기에 표시할 예정입니다.</p>
        </section>
      )}
    </div>
  )
}