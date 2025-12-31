<script setup>
import { computed, nextTick, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppIcon from '@/components/AppIcon.vue';
import { api } from '@/api';
import { useCart } from '@/stores/cart';
import { formatPrice } from '@/utils/format';
import { rememberOrder } from '@/utils/localOrders';
import {
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  getShippingFee,
} from '@shared/shop';

const router = useRouter();
const { items, subtotal, clear, openCart } = useCart();

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  note: '',
});

const shipping = ref('standard');
const payment = ref('online');
const errors = ref({});
const submitting = ref(false);
const submitError = ref('');
const formElement = ref(null);

const shippingOptions = computed(() =>
  SHIPPING_METHODS.map((method) => ({
    ...method,
    fee: getShippingFee(subtotal.value, method.id),
  })),
);

const shippingFee = computed(() => getShippingFee(subtotal.value, shipping.value));
const total = computed(() => subtotal.value + shippingFee.value);
const shippingName = computed(
  () => SHIPPING_METHODS.find((method) => method.id === shipping.value)?.name || '',
);

function clearError(field) {
  if (errors.value[field]) {
    const next = { ...errors.value };
    delete next[field];
    errors.value = next;
  }
}

function validate() {
  const next = {};
  if (form.name.trim().length < 2) next.name = '请填写收货人姓名（至少 2 个字符）';
  if (!/^1[3-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) {
    next.phone = '请输入有效的 11 位手机号';
  }
  if (form.province.trim().length < 2) next.province = '请填写省份';
  if (form.city.trim().length < 2) next.city = '请填写城市';
  if (!form.district.trim()) next.district = '请填写区 / 县';
  if (form.address.trim().length < 4) next.address = '请填写详细的街道门牌地址';
  if (form.note.length > 200) next.note = '备注不能超过 200 个字符';

  errors.value = next;
  return Object.keys(next).length === 0;
}

async function focusFirstError() {
  await nextTick();
  const field = formElement.value?.querySelector('[aria-invalid="true"]');
  field?.focus();
}

async function submitOrder() {
  submitError.value = '';
  if (!validate()) {
    await focusFirstError();
    return;
  }

  submitting.value = true;
  try {
    const { order } = await api.createOrder({
      customer: {
        name: form.name.trim(),
        phone: form.phone.replace(/[\s-]/g, ''),
        province: form.province.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        address: form.address.trim(),
        note: form.note.trim(),
      },
      items: items.value.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shipping: shipping.value,
      payment: payment.value,
    });

    rememberOrder(order.id);
    clear();
    router.push({ name: 'order', params: { id: order.id }, query: { new: '1' } });
  } catch (error) {
    submitError.value = error.message;
    if (error.code === 'OUT_OF_STOCK') {
      submitError.value += '，请返回购物车调整数量。';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="checkout container">
    <header class="checkout-head">
      <div>
        <p class="eyebrow">SECURE CHECKOUT</p>
        <h1>结算</h1>
      </div>
      <ol class="steps" aria-label="结算进度">
        <li class="is-done"><span>01</span>购物车</li>
        <li class="is-current"><span>02</span>填写信息</li>
        <li><span>03</span>完成</li>
      </ol>
    </header>

    <div v-if="items.length === 0" class="checkout-empty">
      <span class="checkout-empty__icon"><AppIcon name="cart" :size="32" /></span>
      <h2>购物车还是空的</h2>
      <p>先挑几件喜欢的东西，再回来结算吧。</p>
      <RouterLink to="/" class="btn btn--primary">
        去逛逛
        <AppIcon name="arrow-right" :size="15" />
      </RouterLink>
    </div>

    <div v-else class="checkout-grid">
      <form ref="formElement" class="checkout-form" novalidate @submit.prevent="submitOrder">
        <section class="form-section">
          <div class="form-section__head">
            <span class="form-section__number">01</span>
            <div>
              <h2>收货信息</h2>
              <p>我们会在 48 小时内为你安排发货。</p>
            </div>
          </div>

          <div class="field-grid">
            <div class="field">
              <label for="checkout-name">收货人</label>
              <input
                id="checkout-name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                placeholder="怎么称呼你"
                maxlength="30"
                :aria-invalid="Boolean(errors.name)"
                :class="{ 'is-invalid': errors.name }"
                @input="clearError('name')"
              />
              <p v-if="errors.name" class="field__error">{{ errors.name }}</p>
            </div>

            <div class="field">
              <label for="checkout-phone">手机号</label>
              <input
                id="checkout-phone"
                v-model="form.phone"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                placeholder="138 0000 0000"
                maxlength="20"
                :aria-invalid="Boolean(errors.phone)"
                :class="{ 'is-invalid': errors.phone }"
                @input="clearError('phone')"
              />
              <p v-if="errors.phone" class="field__error">{{ errors.phone }}</p>
            </div>

            <div class="field">
              <label for="checkout-province">省份</label>
              <input
                id="checkout-province"
                v-model="form.province"
                type="text"
                autocomplete="address-level1"
                placeholder="例如：浙江省"
                maxlength="30"
                :aria-invalid="Boolean(errors.province)"
                :class="{ 'is-invalid': errors.province }"
                @input="clearError('province')"
              />
              <p v-if="errors.province" class="field__error">{{ errors.province }}</p>
            </div>

            <div class="field">
              <label for="checkout-city">城市</label>
              <input
                id="checkout-city"
                v-model="form.city"
                type="text"
                autocomplete="address-level2"
                placeholder="例如：杭州市"
                maxlength="30"
                :aria-invalid="Boolean(errors.city)"
                :class="{ 'is-invalid': errors.city }"
                @input="clearError('city')"
              />
              <p v-if="errors.city" class="field__error">{{ errors.city }}</p>
            </div>

            <div class="field">
              <label for="checkout-district">区 / 县</label>
              <input
                id="checkout-district"
                v-model="form.district"
                type="text"
                autocomplete="address-level3"
                placeholder="例如：西湖区"
                maxlength="30"
                :aria-invalid="Boolean(errors.district)"
                :class="{ 'is-invalid': errors.district }"
                @input="clearError('district')"
              />
              <p v-if="errors.district" class="field__error">{{ errors.district }}</p>
            </div>

            <div class="field">
              <label for="checkout-address">详细地址</label>
              <input
                id="checkout-address"
                v-model="form.address"
                type="text"
                autocomplete="street-address"
                placeholder="街道、门牌号、小区楼栋"
                maxlength="120"
                :aria-invalid="Boolean(errors.address)"
                :class="{ 'is-invalid': errors.address }"
                @input="clearError('address')"
              />
              <p v-if="errors.address" class="field__error">{{ errors.address }}</p>
            </div>
          </div>

          <div class="field field--note">
            <label for="checkout-note">
              订单备注
              <span>选填</span>
            </label>
            <textarea
              id="checkout-note"
              v-model="form.note"
              placeholder="例如：工作日送达，请放在门口"
              maxlength="200"
              :aria-invalid="Boolean(errors.note)"
              @input="clearError('note')"
            ></textarea>
            <div class="field__meta">
              <p v-if="errors.note" class="field__error">{{ errors.note }}</p>
              <span>{{ form.note.length }}/200</span>
            </div>
          </div>
        </section>

        <section class="form-section">
          <div class="form-section__head">
            <span class="form-section__number">02</span>
            <div>
              <h2>配送方式</h2>
              <p>满 ¥199 免标准运费，满 ¥399 免加急运费。</p>
            </div>
          </div>

          <div class="option-grid">
            <label
              v-for="method in shippingOptions"
              :key="method.id"
              class="option-card"
              :class="{ 'is-selected': shipping === method.id }"
            >
              <input v-model="shipping" type="radio" name="shipping" :value="method.id" />
              <span class="option-card__radio" aria-hidden="true"></span>
              <span class="option-card__body">
                <strong>{{ method.name }}</strong>
                <span>{{ method.description }}</span>
              </span>
              <span class="option-card__fee">
                {{ method.fee === 0 ? '免运费' : `+${formatPrice(method.fee)}` }}
              </span>
            </label>
          </div>
        </section>

        <section class="form-section">
          <div class="form-section__head">
            <span class="form-section__number">03</span>
            <div>
              <h2>支付方式</h2>
              <p>这是一个演示项目，不会产生真实扣款。</p>
            </div>
          </div>

          <div class="option-grid">
            <label
              v-for="method in PAYMENT_METHODS"
              :key="method.id"
              class="option-card"
              :class="{ 'is-selected': payment === method.id }"
            >
              <input v-model="payment" type="radio" name="payment" :value="method.id" />
              <span class="option-card__radio" aria-hidden="true"></span>
              <span class="option-card__body">
                <strong>{{ method.name }}</strong>
                <span>{{ method.description }}</span>
              </span>
            </label>
          </div>
        </section>
      </form>

      <aside class="summary">
        <div class="summary__head">
          <h2>订单摘要</h2>
          <button type="button" class="summary__edit" @click="openCart">修改</button>
        </div>

        <ul class="summary__items">
          <li v-for="item in items" :key="item.id" class="summary-item">
            <div class="summary-item__image">
              <img :src="item.image" :alt="item.name" />
              <span>{{ item.quantity }}</span>
            </div>
            <div class="summary-item__info">
              <strong>{{ item.name }}</strong>
              <span>{{ formatPrice(item.price) }} × {{ item.quantity }}</span>
            </div>
            <span class="summary-item__price">{{ formatPrice(item.price * item.quantity) }}</span>
          </li>
        </ul>

        <div class="summary__totals">
          <div><span>商品小计</span><span>{{ formatPrice(subtotal) }}</span></div>
          <div>
            <span>运费 · {{ shippingName }}</span>
            <span>{{ shippingFee === 0 ? '免运费' : formatPrice(shippingFee) }}</span>
          </div>
          <div class="summary__total">
            <span>合计</span>
            <strong>{{ formatPrice(total) }}</strong>
          </div>
        </div>

        <p v-if="submitError" class="summary__error" role="alert">
          <AppIcon name="alert" :size="15" />
          {{ submitError }}
        </p>

        <button
          type="button"
          class="btn btn--primary btn--wide summary__submit"
          :disabled="submitting"
          @click="submitOrder"
        >
          {{ submitting ? '正在提交...' : '提交订单' }}
          <AppIcon v-if="!submitting" name="arrow-right" :size="16" />
        </button>

        <p class="summary__note">
          提交即表示同意山野商店的服务条款。<br />
          演示环境不会产生真实支付。
        </p>

        <div class="summary__trust">
          <span><AppIcon name="shield" :size="15" /> 信息加密</span>
          <span><AppIcon name="truck" :size="15" /> 48 小时发货</span>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.checkout {
  padding-top: 38px;
}

.checkout-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--line);
}

.checkout-head h1 {
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: clamp(44px, 5vw, 60px);
  font-weight: 400;
  letter-spacing: -0.03em;
}

.steps {
  display: flex;
  align-items: center;
  gap: 26px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.steps li {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.04em;
}

.steps span {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 1px solid var(--line);
  border-radius: 50%;
  font-size: 7.5px;
}

.steps .is-done {
  color: var(--forest);
}

.steps .is-done span {
  border-color: var(--forest);
  background: var(--forest);
  color: var(--cream);
}

.steps .is-current {
  color: var(--ink);
}

.steps .is-current span {
  border-color: var(--clay);
  color: var(--clay-deep);
}

.checkout-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 54px;
  align-items: start;
  padding-top: 40px;
}

.checkout-form {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 18px;
}

.form-section {
  padding: 30px 32px;
  border: 1px solid var(--line-soft);
  border-radius: 20px;
  background: rgba(255, 253, 248, 0.66);
}

.form-section__head {
  display: flex;
  gap: 14px;
  margin-bottom: 26px;
}

.form-section__number {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--clay-deep);
  font-family: var(--font-serif);
  font-size: 11px;
}

.form-section__head h2 {
  font-family: var(--font-serif);
  font-size: 23px;
  font-weight: 500;
  line-height: 1.2;
}

.form-section__head p {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10.5px;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 16px;
}

.field-grid .field:nth-child(5) {
  grid-column: 1 / -1;
}

.field--note {
  margin-top: 18px;
}

.field--note label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field--note label span {
  color: var(--muted);
  font-size: 9px;
  font-weight: 400;
}

.field__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 14px;
  color: var(--muted);
  font-size: 9px;
}

.field input.is-invalid,
.field textarea[aria-invalid='true'] {
  border-color: #b96044;
  background: #fffaf6;
}

.option-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.option-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--paper);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.option-card:hover {
  border-color: #b9b09f;
}

.option-card.is-selected {
  border-color: var(--forest);
  background: #fbf8f0;
  box-shadow: 0 0 0 1px var(--forest) inset;
}

.option-card input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.option-card__radio {
  position: relative;
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-top: 1px;
  border: 1px solid #b9b09f;
  border-radius: 50%;
  background: var(--paper);
}

.option-card.is-selected .option-card__radio {
  border-color: var(--forest);
}

.option-card.is-selected .option-card__radio::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--forest);
}

.option-card__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.option-card__body strong {
  font-size: 11.5px;
  font-weight: 600;
}

.option-card__body > span {
  color: var(--muted);
  font-size: 9.5px;
  line-height: 1.5;
}

.option-card__fee {
  margin-left: auto;
  color: var(--muted);
  font-size: 9.5px;
  white-space: nowrap;
}

.option-card.is-selected .option-card__fee {
  color: var(--forest);
}

.summary {
  position: sticky;
  top: 104px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--paper);
  box-shadow: 0 24px 50px rgba(35, 53, 45, 0.06);
}

.summary__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px 17px;
  border-bottom: 1px solid var(--line-soft);
}

.summary__head h2 {
  font-family: var(--font-serif);
  font-size: 21px;
  font-weight: 500;
}

.summary__edit {
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--muted);
  background: transparent;
  color: var(--muted);
  font-size: 9.5px;
  cursor: pointer;
}

.summary__edit:hover {
  color: var(--ink);
}

.summary__items {
  max-height: 330px;
  overflow-y: auto;
  margin: 0;
  padding: 8px 24px;
  list-style: none;
}

.summary-item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line-soft);
}

.summary-item:last-child {
  border-bottom: 0;
}

.summary-item__image {
  position: relative;
  overflow: visible;
  width: 52px;
  height: 52px;
  border-radius: 9px;
  background: var(--sand);
}

.summary-item__image img {
  width: 100%;
  height: 100%;
  border-radius: 9px;
  object-fit: cover;
}

.summary-item__image span {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  place-items: center;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--forest);
  color: var(--cream);
  font-size: 8px;
}

.summary-item__info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.summary-item__info strong {
  overflow: hidden;
  font-family: var(--font-serif);
  font-size: 12.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-item__info span {
  color: var(--muted);
  font-size: 9px;
}

.summary-item__price {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}

.summary__totals {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 16px 24px;
  border-top: 1px solid var(--line-soft);
  background: #fcf8ef;
}

.summary__totals > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--muted);
  font-size: 10.5px;
}

.summary__totals .summary__total {
  align-items: baseline;
  margin-top: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  color: var(--ink);
}

.summary__total strong {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.summary__error {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 0 24px;
  padding: 10px 12px;
  border-radius: 9px;
  background: #f8e8e0;
  color: #8a4933;
  font-size: 10.5px;
  line-height: 1.6;
}

.summary__error svg {
  flex: 0 0 auto;
  margin-top: 1px;
}

.summary__submit {
  width: calc(100% - 48px);
  margin: 16px 24px 0;
}

.summary__note {
  margin-top: 12px;
  padding: 0 24px;
  color: var(--muted);
  font-size: 8.5px;
  line-height: 1.7;
  text-align: center;
}

.summary__trust {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 14px;
  padding: 14px 24px;
  border-top: 1px solid var(--line-soft);
  color: var(--muted);
  font-size: 8.5px;
}

.summary__trust span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.checkout-empty {
  display: flex;
  min-height: 520px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.checkout-empty__icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
}

.checkout-empty h2 {
  margin-top: 22px;
  font-family: var(--font-serif);
  font-size: 30px;
  font-weight: 400;
}

.checkout-empty p {
  margin: 8px 0 22px;
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 1050px) {
  .checkout-grid {
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 32px;
  }

  .form-section {
    padding: 26px;
  }

  .option-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .checkout-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .steps {
    gap: 18px;
  }

  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .summary {
    position: static;
    order: -1;
  }

  .summary__items {
    max-height: none;
  }

  .field-grid {
    gap: 16px 12px;
  }
}

@media (max-width: 560px) {
  .checkout {
    padding-top: 24px;
  }

  .form-section {
    padding: 22px 18px;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .field-grid .field:nth-child(5) {
    grid-column: auto;
  }

  .option-card {
    padding: 14px;
  }

  .steps li {
    font-size: 9px;
  }

  .steps span {
    width: 20px;
    height: 20px;
  }
}
</style>
