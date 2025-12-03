// src/pages/producer/ProducerProductsPage.jsx
import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { AuthContext } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL

// ★ 임시 대분류 카테고리(나중에 API로 교체)
const CATEGORY_TOP_LEVEL = [
  { id: 1, name: '과일·견과' },
  { id: 2, name: '채소·버섯' },
  { id: 3, name: '곡물·콩류' },
  { id: 4, name: '수산물·해산물' },
  { id: 5, name: '축산물·육류' },
]

// ★ 임시 등급/규격 선택 버튼
const GRADE_OPTIONS = ['특', '상', '중', '하']
const UNIT_OPTIONS = ['1kg', '2kg', '3kg', '5kg', '1봉', '1박스']

const KEYWORD_GROUPS = [
  {
    group: "신선도",
    items: [
      { code: "FRESH_TODAY", label: "당일 수확" },
      { code: "SEASONAL", label: "제철 수확" },
    ]
  },
  {
    group: "재배 방식",
    items: [
      { code: "DIRECT_FROM_FARM", label: "산지 직송" },
      { code: "NO_PESTICIDE", label: "무농약/저농약" },
      { code: "ORGANIC", label: "유기농" },
      { code: "FIELD_GROWN", label: "노지 재배" },
    ]
  },
  {
    group: "맛 / 식감",
    items: [
      { code: "SWEET_TASTE", label: "고당도" },
      { code: "JUICY", label: "과즙가득" },
      { code: "CRUNCHY", label: "아삭한 식감" },
      { code: "SOFT_TEXTURE", label: "부드러운 식감" },
    ]
  },
  {
    group: "용도",
    items: [
      { code: "FOR_SALAD", label: "샐러드용" },
      { code: "FOR_SNACK", label: "간식용" },
      { code: "FOR_COOK", label: "요리·조리용" },
      { code: "FOR_JUICE", label: "주스·스무디용" },
    ]
  },
  {
    group: "보관",
    items: [
      { code: "STORAGE_COOL", label: "냉장 보관" },
      { code: "STORAGE_ROOM", label: "실온 보관" },
    ]
  },
  {
    group: "선물",
    items: [
      { code: "GOOD_FOR_GIFT", label: "선물용 포장" },
    ]
  }
];

// modalMode: 'create' | 'edit'
export default function ProducerProductsPage() {
  const { auth } = useContext(AuthContext)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')

  // ===== 모달 관련 상태 =====
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingTarget, setEditingTarget] = useState(null) // 수정 대상 row
  const [selectedKeywords, setSelectedKeywords] = useState([])

  const [formProduct, setFormProduct] = useState({
    productName: '',
    baseCategoryId: null,
    grade: '',
    unitName: '',
    price: '',
    stockQty: '',
    summary: '', // ★ 짧은 설명
    detailDesc: '', // ★ 상세 설명
    origin: '', // ★ 원산지
    harvestDate: '', // ★ 수확일
    expireDate: '', // ★ 유통기한
  })
  const [imageFile, setImageFile] = useState(null) // 대표 이미지
  const [detailImages, setDetailImages] = useState([]) // ★ 상세 이미지들
  const [imagePreview, setImagePreview] = useState('')
  const [isUnitCustom, setIsUnitCustom] = useState(false)

  const IMAGE_UPLOAD_BASE = 'http://192.168.0.76:8080'

  async function uploadImageFile(file) {
    if (!file) return null

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${IMAGE_UPLOAD_BASE}/api/images/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`이미지 업로드 실패: HTTP ${res.status}`)
    }

    const data = await res.json()
    return data.url
  }

  // =========================
  // 상품 목록 조회
  // =========================
  useEffect(() => {
    const token =
      auth?.accessToken || auth?.token || localStorage.getItem('accessToken')

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

        const list = Array.isArray(res.data) ? res.data : []
        setProducts(
          list.map((p) => ({
            ...p,
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

  // =========================
  // 테이블 인라인 수정(가격/재고/규격)
  // =========================
  const handleChangeField = (detailId, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.detailId === detailId ? { ...p, [field]: value } : p)),
    )
  }

  const handleSaveProduct = async (product) => {
    const token =
      auth?.accessToken || auth?.token || localStorage.getItem('accessToken')

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

  // =========================
  // 상품 삭제
  // =========================
  const handleDeleteProduct = async (product) => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return

    const token =
      auth?.accessToken || auth?.token || localStorage.getItem('accessToken')

    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      await axios.delete(
        `${API_BASE}/api/producer/products/${product.productId}`,
        {
          headers: {
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
        },
      )

      setProducts((prev) =>
        prev.filter((p) => p.productId !== product.productId),
      )
      alert('상품이 삭제되었습니다.')
    } catch (err) {
      console.error('상품 삭제 에러:', err)
      alert('상품 삭제 중 오류가 발생했습니다.')
    }
  }

  // =========================
  // 모달 공통 핸들러
  // =========================
  const resetForm = () => {
    setFormProduct({
      productName: '',
      baseCategoryId: null,
      grade: '',
      unitName: '',
      price: '',
      stockQty: '',
      summary: '',
      detailDesc: '',
      origin: '',
      harvestDate: '',
      expireDate: '',
    })
    setImageFile(null)
    setDetailImages([])
    setImagePreview('')
    setIsUnitCustom(false)
    setSelectedKeywords([])
  }

  const openCreateModal = () => {
    setModalMode('create')
    setEditingTarget(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = async (product) => {
    setModalMode('edit')
    setEditingTarget(product)
    resetForm()

    const baseCategoryId = product.baseCategoryId || null
    const grade = product.grade || ''
    const unitName = product.unitName || ''
    const price = product.price ?? ''
    const stockQty = product.stockQty ?? ''

    setFormProduct({
      productName: product.productName || '',
      baseCategoryId,
      grade,
      unitName,
      price,
      stockQty,
      summary: product.summary || '',
      detailDesc: product.detailDesc || '',
      origin: product.origin || '',
      harvestDate: product.harvestDate || '',
      expireDate: product.expireDate || '',
    })

    if (unitName && !UNIT_OPTIONS.includes(unitName)) {
      setIsUnitCustom(true)
    }

    if (product.mainImage) {
      setImagePreview(product.mainImage)
    }

    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleFormChange = (field, value) => {
    setFormProduct((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 대표 이미지 변경
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImageFile(null)
      if (modalMode === 'create') {
        setImagePreview('')
      }
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result || '')
    }
    reader.readAsDataURL(file)
  }

  // 상세 이미지 여러 장
  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    setDetailImages(files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token =
      auth?.accessToken || auth?.token || localStorage.getItem('accessToken')

    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!formProduct.productName) {
      alert('상품명을 입력해 주세요.')
      return
    }
    if (!formProduct.baseCategoryId) {
      alert('카테고리를 선택해 주세요.')
      return
    }
    if (!formProduct.unitName) {
      alert('규격(단위)을 입력해 주세요.')
      return
    }
    if (!formProduct.price) {
      alert('가격을 입력해 주세요.')
      return
    }

    try {
      // 1) 대표 이미지 업로드
      let mainImageUrl = editingTarget?.mainImage || null

      if (imageFile) {
        mainImageUrl = await uploadImageFile(imageFile)
      }

      // 2) 상세 이미지 업로드
      const descriptionImageUrls = []
      if (detailImages && detailImages.length > 0) {
        for (const file of detailImages) {
          const url = await uploadImageFile(file)
          if (url) descriptionImageUrls.push(url)
        }
      }

      // 3) JSON payload
      const payload = {
        productName: formProduct.productName,
        baseCategoryId: formProduct.baseCategoryId,
        grade: formProduct.grade || '',
        unitName: formProduct.unitName,
        price: Number(formProduct.price),
        stockQty: Number(formProduct.stockQty || 0),
        summary: formProduct.summary || '',
        detailDesc: formProduct.detailDesc || '',
        origin: formProduct.origin || '',
        harvestDate: formProduct.harvestDate || '',
        expireDate: formProduct.expireDate || '',
        mainImageUrl,
        descriptionImageUrls,
      }

      let res

      if (modalMode === 'create') {
        // 신규 등록
        res = await axios.post(`${API_BASE}/api/producer/products`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
        })

        alert('상품이 등록되었습니다.')

        if (res.data) {
          setProducts((prev) => [...prev, res.data])
        }
      } else if (modalMode === 'edit' && editingTarget) {
        // 수정
        res = await axios.patch(
          `${API_BASE}/api/producer/products/${editingTarget.productId}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token.startsWith('Bearer ')
                ? token
                : `Bearer ${token}`,
            },
          },
        )

        alert('상품 정보가 수정되었습니다.')

        if (res.data) {
          const updated = res.data
          setProducts((prev) =>
            prev.map((p) =>
              p.productId === updated.productId
                ? {
                    ...p,
                    productName: updated.productName,
                    unitName: updated.unitName,
                    price: updated.price,
                    stockQty: updated.stockQty,
                    status: updated.status ?? p.status,
                  }
                : p,
            ),
          )
        }
      }

      closeModal()
    } catch (err) {
      console.error('상품 등록/수정 에러:', err)
      alert(err.message || '상품을 저장하는 중 오류가 발생했습니다.')
    }
  }

  // =========================
  // 렌더링
  // =========================
  if (loading) return <div>상품 정보를 불러오는 중입니다...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <PageWrapper>
      <PageHeader>
        <h2>상품 관리</h2>
        <HeaderRight>
          <PrimaryButton type="button" onClick={openCreateModal}>
            + 상품 등록
          </PrimaryButton>
        </HeaderRight>
      </PageHeader>

      <SectionCard>
        <SectionTitle>내 상품 목록</SectionTitle>
        {products.length === 0 ? (
          <EmptyText>등록된 상품이 없습니다.</EmptyText>
        ) : (
          <StyledTable>
            <thead>
              <tr>
                <th>상품명</th>
                <th>규격(단위)</th>
                <th>가격</th>
                <th>재고</th>
                <th>상태</th>
                <th>정보 수정</th>
                <th>저장</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.detailId}>
                  <td>{p.productName}</td>
                  <td>
                    <TableInput
                      type="text"
                      value={p.unitName || ''}
                      onChange={(e) =>
                        handleChangeField(p.detailId, 'unitName', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <TableInput
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
                    <StockInput
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
                  <td>
                    <StatusCircle status={p.status}>{p.status}</StatusCircle>
                  </td>
                  <td>
                    <EditCircleButton
                      type="button"
                      onClick={() => openEditModal(p)}
                    >
                      수정
                    </EditCircleButton>
                  </td>
                  <td>
                    <SaveCircleButton
                      type="button"
                      disabled={savingId === p.detailId}
                      onClick={() => handleSaveProduct(p)}
                    >
                      저장
                    </SaveCircleButton>
                  </td>
                  <td>
                    <DeleteCircleButton
                      type="button"
                      onClick={() => handleDeleteProduct(p)}
                    >
                      삭제
                    </DeleteCircleButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        )}
      </SectionCard>

      <SectionCard>
        <SectionTitle>재고 현황 (간단 요약)</SectionTitle>
        {products.length === 0 ? (
          <EmptyText>표시할 상품이 없습니다.</EmptyText>
        ) : (
          <StockList>
            {products.map((p) => (
              <li key={p.detailId}>
                <span className="name">{p.productName}</span>
                <span className="unit">({p.unitName})</span>
                <span className="qty">{p.stockQty}개</span>
              </li>
            ))}
          </StockList>
        )}
      </SectionCard>

      {/* ====================== */}
      {/*  등록 / 수정 공용 모달   */}
      {/* ====================== */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? '상품 등록' : '상품 정보 수정'}
              </ModalTitle>
              <ModalCloseButton type="button" onClick={closeModal}>
                ×
              </ModalCloseButton>
            </ModalHeader>

            <ModalBody>
              <form onSubmit={handleSubmit}>
                {/* 상품명 */}
                <FormRow>
                  <FormLabel>상품명</FormLabel>
                  <TextInput
                    type="text"
                    value={formProduct.productName}
                    onChange={(e) =>
                      handleFormChange('productName', e.target.value)
                    }
                    placeholder="예) 꿀사과 3kg 박스"
                  />
                </FormRow>

                {/* 짧은 소개 */}
                <FormRow>
                  <FormLabel>짧은 소개</FormLabel>
                  <TextInput
                    type="text"
                    value={formProduct.summary}
                    onChange={(e) =>
                      handleFormChange('summary', e.target.value)
                    }
                    placeholder="예) 아삭하고 달콤한 꿀사과입니다."
                  />
                </FormRow>

                {/* 대표 이미지 */}
                <FormRow>
                  <FormLabel>대표 이미지</FormLabel>
                  <TextInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {modalMode === 'edit' && !imagePreview && (
                    <HelperText>
                      * 파일을 선택하지 않으면 기존 이미지를 유지합니다.
                    </HelperText>
                  )}
                  {imagePreview && (
                    <ImagePreviewWrapper>
                      <img src={imagePreview} alt="미리보기" />
                    </ImagePreviewWrapper>
                  )}
                </FormRow>

                {/* 상세 이미지 여러 장 */}
                <FormRow>
                  <FormLabel>상세 이미지 (최대 5장)</FormLabel>
                  <TextInput
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDetailImagesChange}
                  />
                  <HelperText>
                    * 상품 상세 설명에 들어갈 이미지들을 선택해 주세요.
                  </HelperText>
                </FormRow>

                {/* 대분류 카테고리 버튼 */}
                <FormRow>
                  <FormLabel>카테고리 (대분류)</FormLabel>
                  <ButtonGroup>
                    {CATEGORY_TOP_LEVEL.map((c) => (
                      <OptionButton
                        key={c.id}
                        type="button"
                        $active={formProduct.baseCategoryId === c.id}
                        onClick={() => handleFormChange('baseCategoryId', c.id)}
                      >
                        {c.name}
                      </OptionButton>
                    ))}
                  </ButtonGroup>
                </FormRow>

                {/* 등급 선택 */}
                <FormRow>
                  <FormLabel>등급</FormLabel>
                  <ButtonGroup>
                    {GRADE_OPTIONS.map((g) => (
                      <OptionButton
                        key={g}
                        type="button"
                        $active={formProduct.grade === g}
                        onClick={() => handleFormChange('grade', g)}
                      >
                        {g}
                      </OptionButton>
                    ))}
                  </ButtonGroup>
                </FormRow>

                {/* 규격(단위) */}
                <FormRow>
                  <FormLabel>규격(단위)</FormLabel>
                  <ButtonGroup>
                    {UNIT_OPTIONS.map((u) => (
                      <OptionButton
                        key={u}
                        type="button"
                        $active={!isUnitCustom && formProduct.unitName === u}
                        onClick={() => {
                          setIsUnitCustom(false)
                          handleFormChange('unitName', u)
                        }}
                      >
                        {u}
                      </OptionButton>
                    ))}

                    <OptionButton
                      type="button"
                      $active={isUnitCustom}
                      onClick={() => {
                        setIsUnitCustom(true)
                        handleFormChange('unitName', '')
                      }}
                    >
                      기타
                    </OptionButton>
                  </ButtonGroup>

                  {isUnitCustom && (
                    <TextInput
                      style={{ marginTop: '8px' }}
                      type="text"
                      value={formProduct.unitName}
                      onChange={(e) =>
                        handleFormChange('unitName', e.target.value)
                      }
                      placeholder="예) 300g, 10개입, 1망 등"
                    />
                  )}
                </FormRow>

                {/* 가격 */}
                <FormRow>
                  <FormLabel>가격</FormLabel>
                  <TextInput
                    type="number"
                    min={0}
                    value={formProduct.price}
                    onChange={(e) =>
                      handleFormChange('price', e.target.value)
                    }
                    placeholder="예) 25000"
                  />
                </FormRow>

                {/* 재고 */}
                <FormRow>
                  <FormLabel>재고</FormLabel>
                  <TextInput
                    type="number"
                    min={0}
                    value={formProduct.stockQty}
                    onChange={(e) =>
                      handleFormChange('stockQty', e.target.value)
                    }
                    placeholder="예) 100"
                  />
                </FormRow>

                {/* 설명 키워드 선택 */}
                <FormRow>
                  <FormLabel>설명 키워드 선택</FormLabel>

                  <KeywordGrid>
                    {KEYWORD_GROUPS.map((group) => (
                      <KeywordGroup key={group.group}>
                        <KeywordGroupTitle>{group.group}</KeywordGroupTitle>

                        <KeywordButtonsRow>
                          {group.items.map((k) => (
                            <KeywordButton
                              key={k.code}
                              type="button"
                              $active={selectedKeywords.includes(k.code)}
                              onClick={() => {
                                setSelectedKeywords((prev) =>
                                  prev.includes(k.code)
                                    ? prev.filter((c) => c !== k.code)
                                    : [...prev, k.code]
                                );
                              }}
                            >
                              {k.label}
                            </KeywordButton>
                          ))}
                        </KeywordButtonsRow>
                      </KeywordGroup>
                    ))}
                  </KeywordGrid>

                  <SecondaryButton
                    type="button"
                    style={{
                      marginTop: "14px",
                      width: "100%",
                      justifyContent: "center",
                      padding: "12px 18px",
                      fontSize: "15px",
                      borderRadius: "12px",
                    }}
                    onClick={() => {
                      const templates = {
                        // 신선도·수확
                        FRESH_TODAY:   "수확 당일 선별·포장해 신선함을 그대로 담았습니다.",
                        SEASONAL:      "가장 맛이 오르는 제철에 수확해 풍부한 풍미를 느끼실 수 있어요.",

                        // 재배 방식·안심
                        DIRECT_FROM_FARM: "산지에서 바로 보내 유통 단계를 줄이고 신선함과 가성비를 모두 챙겼습니다.",
                        NO_PESTICIDE:     "화학 농약 사용을 최소화한 재배 방식으로 안심하고 드실 수 있습니다.",
                        ORGANIC:          "인증 기준에 맞춰 재배한 유기농 농산물로 건강한 한 끼를 준비해 보세요.",
                        FIELD_GROWN:      "햇볕과 바람을 그대로 받는 노지 재배로 건강한 맛을 살렸습니다.",

                        // 맛·식감
                        SWEET_TASTE:  "높은 당도로 한입 베어 물면 달콤한 맛이 입안 가득 퍼집니다.",
                        JUICY:        "속이 촉촉하고 과즙이 풍부해 한 입마다 상큼한 즐거움을 전해줍니다.",
                        CRUNCHY:      "아삭한 식감이 살아 있어 샐러드나 생식용으로도 잘 어울립니다.",
                        SOFT_TEXTURE: "부드러운 식감으로 아이들이나 어르신도 부담 없이 드실 수 있습니다.",

                        // 용도
                        FOR_SALAD:    "씻어서 바로 사용하기 좋아 샐러드·피클 등 간편 요리에 제격입니다.",
                        FOR_SNACK:    "손에 집기 좋은 크기로 간식이나 도시락, 간단한 주전부리로 활용하기 좋습니다.",
                        FOR_COOK:     "구이, 볶음, 찜 등 다양한 조리에 두루 잘 어울리는 만능 재료입니다.",
                        FOR_JUICE:    "착즙 주스나 스무디로 활용하기 좋아 상큼한 음료로 즐기기 좋습니다.",

                        // 보관·선물
                        STORAGE_COOL: "구매 후 냉장 보관하시면 더 오래 신선하게 즐기실 수 있습니다.",
                        STORAGE_ROOM: "서늘하고 직사광선을 피한 실온에 보관해 주세요.",
                        GOOD_FOR_GIFT:"깔끔한 포장으로 선물용으로도 손색 없는 구성입니다.",
                      };

                      let result = selectedKeywords
                        .map((code) => templates[code])
                        .filter(Boolean)
                        .join("\n");

                      if (!result) {
                        result = "정성껏 재배한 신선한 농산물입니다.";
                      }

                      handleFormChange("detailDesc", result);
                    }}
                  >
                    선택한 키워드로 자동 작성
                  </SecondaryButton>
                </FormRow>

                {/* 상세 설명 */}
                <FormRow>
                  <FormLabel>상세 설명</FormLabel>
                  <TextArea
                    rows={5}
                    value={formProduct.detailDesc}
                    onChange={(e) =>
                      handleFormChange('detailDesc', e.target.value)
                    }
                    placeholder="상품의 산지, 특징, 보관방법 등을 적어주세요."
                  />
                </FormRow>

                {/* 원산지 */}
                <FormRow>
                  <FormLabel>원산지</FormLabel>
                  <TextInput
                    type="text"
                    value={formProduct.origin}
                    onChange={(e) =>
                      handleFormChange('origin', e.target.value)
                    }
                    placeholder="예) 경북 영주"
                  />
                </FormRow>

                {/* 수확일 */}
                <FormRow>
                  <FormLabel>수확일</FormLabel>
                  <TextInput
                    type="date"
                    value={formProduct.harvestDate}
                    onChange={(e) =>
                      handleFormChange('harvestDate', e.target.value)
                    }
                  />
                </FormRow>

                {/* 유통기한 */}
                <FormRow>
                  <FormLabel>유통기한</FormLabel>
                  <TextInput
                    type="date"
                    value={formProduct.expireDate}
                    onChange={(e) =>
                      handleFormChange('expireDate', e.target.value)
                    }
                  />
                </FormRow>

                <ModalFooter>
                  <SecondaryButton type="button" onClick={closeModal}>
                    취소
                  </SecondaryButton>
                  <PrimaryButton type="submit">
                    {modalMode === 'create' ? '등록' : '수정 저장'}
                  </PrimaryButton>
                </ModalFooter>
              </form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  )
}

/* =========================
 * styled-components
 * ========================= */

const PageWrapper = styled.div`
  padding: 24px 20px;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;

  h2 {
    font-size: 22px;
    font-weight: 700;
  }
`

const HeaderRight = styled.div`
  display: flex;
  gap: 8px;
`

const SectionCard = styled.section`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04)
  padding: 18px 20px 20px;
  margin-bottom: 16px;
`

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
`

const EmptyText = styled.p`
  color: #888;
  font-size: 14px;
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead tr {
    background: #f5f7fa;
  }

  th,
  td {
    border-bottom: 1px solid #eceff4;
    padding: 8px 10px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    font-weight: 600;
    color: #555;
  }

  tbody tr:hover {
    background: #fafbff;
  }
`

const TableInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d0d7e2;
  font-size: 13px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.12);
  }
`

const StockInput = styled(TableInput)`
  width: 70px;
  text-align: center;
`

const StatusCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ status }) =>
    status === 'ON' || status === '판매중'
      ? '#4caf50'
      : status === 'OFF' || status === '판매중지'
      ? '#9e9e9e'
      : '#607d8b'};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`

const StockList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;

  li {
    display: flex;
    gap: 4px;
    padding: 6px 0;
    border-bottom: 1px dashed #eee;
  }

  .name {
    font-weight: 500;
  }
  .unit {
    color: #777;
  }
  .qty {
    margin-left: auto;
    font-weight: 600;
  }
`

const BaseButton = styled.button`
  border-radius: 999px;
  padding: 9px 18px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 40px;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

const PrimaryButton = styled(BaseButton)`
  background: #4caf50;
  color: #fff;
  font-weight: 600;

  &:hover:not(:disabled) {
    background: #43a047;
  }
`

const SecondaryButton = styled(BaseButton)`
  background: #f1f3f7;
  color: #333;
  border: 1px solid #d0d7e2;

  &:hover:not(:disabled) {
    background: #e4e7f0;
  }
`

const SaveCircleButton = styled(BaseButton)`
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  background: #4caf50;
  color: #fff;
  font-weight: 600;

  &:hover:not(:disabled) {
    background: #43a047;
  }
`

const EditCircleButton = styled(BaseButton)`
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 80%;
  background: #ffffff;
  border: 1px solid #d0d7e2;
  color: #333;
  font-weight: 500;
  font-size: 12px;
  line-height: 1;

  &:hover:not(:disabled) {
    background: #f5f7fa;
  }
`

const DeleteCircleButton = styled(BaseButton)`
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  background: #f44336;
  color: #fff;
  font-weight: 600;

  &:hover:not(:disabled) {
    background: #d32f2f;
  }
`

/* ===== 모달 ===== */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
`

const ModalContent = styled.div`
  width: min(860px, 94vw);
  max-height: 88vh;
  background: #f5faf6;
  border-radius: 20px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ModalHeader = styled.div`
  padding: 18px 24px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #ffffff;
`

const ModalCloseButton = styled.button`
  border: none;
  background: rgba(255, 255, 255, 0.16);
  font-size: 22px;
  cursor: pointer;
  color: #ffffff;
  line-height: 1;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.26);
  }
`

const ModalBody = styled.div`
  padding: 18px 22px 20px;
  overflow-y: auto;
  background: radial-gradient(
    circle at top left,
    #e8f5e9 0,
    #f5faf6 40%,
    #ffffff 100%
  );
`

const FormRow = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e3e8ef;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.06);
`

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const TextInput = styled.input`
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 15px;
  box-sizing: border-box;
  background: #f9fafb;

  &:focus {
    outline: none;
    border-color: #43a047;
    box-shadow: 0 0 0 2px rgba(67, 160, 71, 0.18);
    background: #ffffff;
  }
`

const TextArea = styled.textarea`
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 15px;
  resize: vertical;
  min-height: 140px;
  background: #f9fafb;

  &:focus {
    outline: none;
    border-color: #43a047;
    box-shadow: 0 0 0 2px rgba(67, 160, 71, 0.18);
    background: #ffffff;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const OptionButton = styled.button`
  padding: 10px 16px;
  min-height: 40px;
  font-size: 14px;

  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? '#43a047' : '#d0d7e2')};
  background: ${({ $active }) => ($active ? '#e1f5e5' : '#f8fafc')};
  color: ${({ $active }) => ($active ? '#1b5e20' : '#374151')};
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  transition: all 0.12s ease-out;

  &:hover {
    background: ${({ $active }) => ($active ? '#d4f0d9' : '#eef2ff')};
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`

const KeywordGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
  align-items: flex-start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const KeywordGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const KeywordGroupTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #4a4a4a;
  margin-bottom: 4px;
`

const KeywordButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const KeywordButton = styled.button`
  flex: 0 0 calc(50% - 4px);           /* ⭐ 한 줄에 2개, 같은 넓이 */
  padding: 10px 14px;
  min-height: 40px;
  font-size: 14px;
  border-radius: 10px;

  border: 1px solid ${({ $active }) => ($active ? '#43a047' : '#d0d7e2')};
  background: ${({ $active }) => ($active ? '#e1f5e5' : '#f8fafc')};
  color: ${({ $active }) => ($active ? '#1b5e20' : '#374151')};

  cursor: pointer;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  transition: all 0.12s ease-out;

  &:hover {
    background: ${({ $active }) => ($active ? '#d4f0d9' : '#eef2ff')};
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const ImagePreviewWrapper = styled.div`
  margin-top: 8px;

  img {
    width: 190px;
    border-radius: 12px;
    border: 1px solid #e0e6f0;
    object-fit: cover;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
  }
`

const HelperText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`

const ModalFooter = styled.div`
  margin-top: 18px;
  padding-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #e2e8f0;
  background: linear-gradient(to top, #f8fafc, transparent);
`