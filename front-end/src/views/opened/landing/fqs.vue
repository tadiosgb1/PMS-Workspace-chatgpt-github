<template>
  <section class="py-24 bg-white relative overflow-hidden">
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-50"></div>

    <div class="max-w-4xl mx-auto px-6 relative z-10">
      
      <div class="text-center mb-16">
        <span class="inline-block px-4 py-1.5 mb-4 text-[10px] font-black tracking-[0.3em] text-primary bg-primary/10 rounded-full uppercase">
          Support Center
        </span>
        <h2 class="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          Got <span class="text-primary">Questions?</span>
        </h2>
        <p class="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
          Everything you need to know about using <span class="text-dprimary font-bold border-b-2 border-secondary/30">Alpha PMS</span> to automate your property empire.
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="group border border-slate-100 rounded-[2rem] transition-all duration-300 overflow-hidden"
          :class="activeIndex === index ? 'bg-slate-50 shadow-xl shadow-slate-200/50 border-primary/20' : 'bg-white hover:border-slate-300'"
        >
          <button
            @click="toggleFaq(index)"
            class="w-full flex items-center justify-between p-8 text-left outline-none"
          >
            <div class="flex items-center gap-5">
              <span 
                class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-300"
                :class="activeIndex === index ? 'bg-primary text-white rotate-12' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'"
              >
                {{ index + 1 }}
              </span>
              <h3 class="text-lg font-black text-slate-800 tracking-tight transition-colors" :class="{'text-primary': activeIndex === index}">
                {{ faq.question }}
              </h3>
            </div>
            
            <div 
              class="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500"
              :class="activeIndex === index ? 'bg-primary border-primary rotate-180 text-white' : 'border-slate-200 text-slate-400'"
            >
              <i class="fas fa-chevron-down text-[10px]"></i>
            </div>
          </button>

          <div
            class="transition-all duration-500 ease-in-out overflow-hidden"
            :style="{ maxHeight: activeIndex === index ? '500px' : '0px', opacity: activeIndex === index ? '1' : '0' }"
          >
            <div class="px-8 pb-8 pt-0 ml-14">
              <p class="text-slate-500 leading-relaxed font-medium">
                {{ faq.answer }}
              </p>
              
              <div class="mt-6 flex items-center gap-4 border-t border-slate-100 pt-6">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Was this helpful?</span>
                <button class="text-xs hover:text-primary transition-colors text-slate-300"><i class="fas fa-thumbs-up"></i></button>
                <button class="text-xs hover:text-secondary transition-colors text-slate-300"><i class="fas fa-thumbs-down"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const activeIndex = ref(0) // Default open first one

const toggleFaq = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}

const faqs = [
  {
    question: 'What is Alpha PMS?',
    answer: 'Alpha PMS is a cloud-based Property Management System designed to help landlords, agents, and property managers efficiently manage their real estate portfolios with automated workflows and real-time data.'
  },
  {
    question: 'Can I manage multiple properties with Alpha?',
    answer: 'Yes! Alpha allows you to manage unlimited properties, tenants, and units from a single dashboard. Our system architecture is built to scale from a single apartment to massive commercial portfolios.'
  },
  {
    question: 'Is Alpha PMS suitable for both residential and commercial?',
    answer: 'Absolutely. Alpha is built to handle both residential and commercial real estate, including apartments, office spaces, warehouses, and mixed-use buildings with custom lease types.'
  },
  {
    question: 'Does Alpha include rent collection features?',
    answer: 'Yes, Alpha enables you to track rent payments, send automated SMS/Email reminders, generate professional invoices, and maintain a full ledger of payment history per tenant.'
  },
  {
    question: 'Can tenants access the system?',
    answer: 'Tenants get their own dedicated mobile-friendly portal. They can view their lease status, track payment history, download receipts, and submit maintenance tickets directly to you.'
  },
  {
    question: 'Is 24/7 support available?',
    answer: 'We provide premium support via live chat, email, and phone. Every Alpha subscriber gets access to our knowledge base and a dedicated account manager for enterprise plans.'
  }
]
</script>

<style scoped>
/* Custom animations */
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>