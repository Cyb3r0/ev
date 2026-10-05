package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.Artwork
import com.example.ui.theme.JaxBasalt
import com.example.ui.theme.JaxBlack
import com.example.ui.theme.JaxCyanHolo
import com.example.ui.theme.JaxGold
import com.example.ui.theme.JaxGoldLight
import com.example.ui.theme.JaxLimestone
import com.example.ui.theme.JaxSandstone
import com.example.ui.theme.JaxSurfaceCard
import com.example.ui.theme.JaxSurfaceDark
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class CuratorChatMessage(
    val sender: String, // "user" or "curator"
    val text: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiCuratorDialog(
    artwork: Artwork,
    isArabic: Boolean,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val coroutineScope = rememberCoroutineScope()

    var userQuery by remember { mutableStateOf("") }
    var isThinking by remember { mutableStateOf(false) }

    val messages = remember {
        mutableStateListOf(
            CuratorChatMessage(
                sender = "curator",
                text = if (isArabic) {
                    "مرحباً بك في حي جاكس للفنون بالدرعية. أنا قيّم المعارض الذكي المرافق لك. كيف يمكنني مساعدتك في استكشاف عمل '${artwork.titleAr}' للفنان ${artwork.artistAr} أو الإجابة عن تاريخ الحي الفني؟"
                } else {
                    "Welcome to JAX District in Diriyah. I am your AI Art Curator companion. Ask me anything about '${artwork.titleEn}' by ${artwork.artistEn}, its cultural resonance, or the architectural history of JAX!"
                }
            )
        )
    }

    val suggestionChips = remember(artwork.id, isArabic) {
        if (isArabic) {
            listOf(
                "ما الدلالة التراثية لهذا العمل؟",
                "كيف يرتبط بوادي حنيفة وعمارة الطين؟",
                "ما هي قصة حي جاكس وتحوله الفني؟",
                "اشرح لي أسلوب الفنان التقني"
            )
        } else {
            listOf(
                "What is the cultural symbolism?",
                "How does it relate to Wadi Hanifa?",
                "Tell me about JAX District history",
                "Explain the artist's medium"
            )
        }
    }

    fun handleSend(query: String) {
        if (query.isBlank() || isThinking) return
        messages.add(CuratorChatMessage("user", query))
        userQuery = ""
        isThinking = true

        coroutineScope.launch {
            delay(1200) // Realistic conversational cadence
            val response = generateCuratorAnswer(query, artwork, isArabic)
            messages.add(CuratorChatMessage("curator", response))
            isThinking = false
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = JaxSurfaceDark,
        tonalElevation = 8.dp
    ) {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 28.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(JaxGold.copy(alpha = 0.2f))
                            .border(1.dp, JaxGold, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "AI",
                            tint = JaxGoldLight,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = if (isArabic) "قيّم جاكس الذكي" else "JAX AI Art Curator",
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (isArabic) "مرشد نقد الفنون والتراث المعاصر" else "Contemporary Art & Heritage Specialist",
                            color = JaxGold,
                            fontSize = 10.sp
                        )
                    }
                }

                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = JaxLimestone
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Chat Scroll Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(JaxBlack)
                    .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(14.dp))
                    .padding(12.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    messages.forEach { msg ->
                        val isCurator = msg.sender == "curator"
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = if (isCurator) Arrangement.Start else Arrangement.End
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth(0.85f)
                                    .clip(
                                        RoundedCornerShape(
                                            topStart = 12.dp,
                                            topEnd = 12.dp,
                                            bottomStart = if (isCurator) 2.dp else 12.dp,
                                            bottomEnd = if (isCurator) 12.dp else 2.dp
                                        )
                                    )
                                    .background(
                                        if (isCurator) JaxSurfaceCard else JaxGold.copy(alpha = 0.22f)
                                    )
                                    .border(
                                        1.dp,
                                        if (isCurator) Color.White.copy(alpha = 0.08f) else JaxGold.copy(alpha = 0.5f),
                                        RoundedCornerShape(12.dp)
                                    )
                                    .padding(12.dp)
                            ) {
                                Text(
                                    text = msg.text,
                                    color = if (isCurator) JaxLimestone else Color.White,
                                    fontSize = 12.sp,
                                    lineHeight = 19.sp
                                )
                            }
                        }
                    }

                    if (isThinking) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CircularProgressIndicator(
                                color = JaxGold,
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isArabic) "القيّم يستحضر الرؤية النقدية..." else "Curator is analyzing...",
                                color = JaxSandstone,
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Suggestion Chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(suggestionChips) { chip ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(JaxSurfaceCard)
                            .border(1.dp, JaxGold.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                            .clickable { handleSend(chip) }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = chip,
                            color = JaxGoldLight,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Input Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = userQuery,
                    onValueChange = { userQuery = it },
                    placeholder = {
                        Text(
                            text = if (isArabic) "اكتب سؤالك للقيّم الفني..." else "Ask the art curator...",
                            color = JaxSandstone.copy(alpha = 0.6f),
                            fontSize = 12.sp
                        )
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = JaxGold,
                        unfocusedBorderColor = Color.White.copy(alpha = 0.15f),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        cursorColor = JaxGold
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f)
                )

                Spacer(modifier = Modifier.width(8.dp))

                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(JaxGold)
                        .clickable { handleSend(userQuery) },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Send",
                        tint = JaxBlack,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

private fun generateCuratorAnswer(query: String, artwork: Artwork, isArabic: Boolean): String {
    val q = query.lowercase()

    return if (isArabic) {
        when {
            q.contains("تراث") || q.contains("رمزية") || q.contains("رمز") -> {
                "يرتكز عمل '${artwork.titleAr}' على استلهام الموروث البصري لنجد وحي الطريف التاريخي المسجل في اليونسكو. يحوّل الفنان الرموز التاريخية مثل الفتحات المثلثية والخطوط الزخرفية إلى لغة معاصرة تعبر عن الهوية الوطنية المتطلعة للمستقبل عبر بوابات الرؤية والواقع المعزز."
            }
            q.contains("وادي حنيفة") || q.contains("طين") || q.contains("طبيعة") -> {
                "حي جاكس يقع على ضفاف وادي حنيفة، وهو الشريان البيئي والتاريخي للدرعية. المواد المستخدمة في هذا العمل ترتبط مباشرة بصلابة جبال طويق ونعومة طمي الوادي، مما يعكس دورة الحياة والخصوبة التي جعلت من هذا المكان منطلقاً للدولة السعودية الأولى."
            }
            q.contains("تاريخ") || q.contains("جاكس") || q.contains("حي") -> {
                "حي جاكس (JAX) كان في الأصل منطقة مستودعات صناعية تأسست في سبعينيات القرن الماضي. أطلقت وزارة الثقافة السعودية مشروعاً رائداً لتحويل هذه الهناجر الصناعية الضخمة إلى أكبر حي إبداعي للفنون المعاصرة في المملكة، يضم مقرات البينالي واستوديوهات لأكثر من مئة فنان سعودي وعالمي."
            }
            else -> {
                "بالنظر إلى خامة '${artwork.mediumAr}'، نجد أن الفنان ${artwork.artistAr} يتعمد خلق تباين بصري بين قسوة المعدن أو الصخر وأثيرية الضوء. تجربة الواقع المعزز التي تشاهدها الآن تكشف عن الطبقات الهندسية الخفية داخل العمل التي لا يمكن للعين المجردة إدراكها إلا عبر الوسائط الرقمية."
            }
        }
    } else {
        when {
            q.contains("symbol") || q.contains("culture") || q.contains("heritage") -> {
                "'${artwork.titleEn}' draws deeply on the architectural vernacular of At-Turaif, UNESCO World Heritage site adjacent to JAX. The artist translates ancient triangular motifs and earthcraft into dynamic spatial coordinates through AR."
            }
            q.contains("wadi") || q.contains("clay") || q.contains("nature") -> {
                "Situated along the edge of historic Wadi Hanifa, JAX art pieces directly honor the seasonal desert flows and fertile oasis palms that have sustained Diriyah for centuries."
            }
            q.contains("history") || q.contains("jax") || q.contains("district") -> {
                "JAX was originally a mid-century industrial warehouse park. Led by the Ministry of Culture, it was revitalized into Saudi Arabia's premier contemporary art district, home to the Diriyah Biennale Foundation and dozens of creator studios."
            }
            else -> {
                "Utilizing ${artwork.mediumEn}, ${artwork.artistEn} constructs a compelling paradox between industrial rigidity and ethereal light. Through our AR layer, you can observe the internal mathematical harmony usually invisible to the naked eye."
            }
        }
    }
}
